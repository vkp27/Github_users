import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

//to create context
const GithubContext = React.createContext();

//Now we have access to two components
// Provider and consumer
//We can access by typing GithubContext.Provider

const GithubProvider = ({children}) => {
    const [githubUser, setGithubUser] = useState(mockUser);
    const [repos, setRepos] = useState(mockRepos);
    const [followers, setFollowers] = useState(mockFollowers);
    //request loading
    const [requests, setRequests] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    //error
    const [error, setError] = useState({show: false,msg: ''})

    const searchGithubUser = async (user) => {
        //we invoke this function to remove the error msg.
        toggleError()
        setIsLoading(true)
        //to fetch the ajax request when we search for a user we use axios.
        const response = await axios(`${rootUrl}/users/${user}`).catch((err) => console.log(err))
       
        if(response) {
            setGithubUser(response.data)
            const {login, followers_url} = response.data
            //repos url setup
            // axios(`${rootUrl}/users/${login}/repos?per_page=100`).then((response) => setRepos(response.data))

            //followers url setup
            // axios(`${followers_url}?per_page=100`).then((response) => setFollowers(response.data))
            //more logic
            //to fetch all the data at once we use promise.allSettled.
            await Promise.allSettled([
                axios(`${rootUrl}/users/${login}/repos?per_page=100`),
                axios(`${followers_url}?per_page=100`),
            ]).then((results) => {
                 const [repos, followers] = results
                 const status = 'fulfilled'
                 if(repos.status === status) {
                     setRepos(repos.value.data)
                 }
                 if(followers.status === status) {
                     setFollowers(followers.value.data)
                 }
            }).catch (err => console.log(err))
        }
        else {
            toggleError(true,'there is no user with that username')
        }
        checkRequests();
        setIsLoading(false);
    }
    // check rate/requests
    const checkRequests = () => {
        //in place of fetch to get data we use axios.
        //axios returns promise
        axios(`${rootUrl}/rate_limit`).then(({data}) => {
            let {
                rate: {remaining},
            } = data
            
            setRequests(remaining)
            if(remaining === 0) {
                //throw an error
                toggleError(true,'sorry, you have exceeded your hourly rate limit')
            }
        }).catch((err) => console.log(err))
    }
    //error
    function toggleError (show = false,msg = '') {
        setError({show,msg})
    }
    //here once our app loads we use checkrequest as a callback function.
    useEffect(checkRequests,[])
    return (
        <GithubContext.Provider value={{githubUser, repos, followers, requests, error, searchGithubUser,isLoading,}}>
            {children}
        </GithubContext.Provider>
    );
}

export {GithubProvider, GithubContext};
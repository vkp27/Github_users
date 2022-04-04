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
    const [loading, setLoading] = useState(false)
    //error
    const [error, setError] = useState({show: false,msg: ''})
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
        <GithubContext.Provider value={{githubUser, repos, followers, requests, error}}>
            {children}
        </GithubContext.Provider>
    );
}

export {GithubProvider, GithubContext};
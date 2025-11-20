import axios from 'axios';

const apiURL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const api = axios.create({
    baseURL: apiURL,
    withCredentials: true
})

// impelement no caching for all data that require strict integration
api.interceptors.request.use(async (config) => {
    config.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    return config;
})

export default api;
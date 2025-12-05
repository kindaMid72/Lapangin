import axios from 'axios';

const apiURL = process.env.NEXT_PUBLIC_SERVER_API_URL;
const api = axios.create({
    baseURL: apiURL,
    withCredentials: true
})

export default api;
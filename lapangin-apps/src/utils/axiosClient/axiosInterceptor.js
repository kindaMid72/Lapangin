import axios from 'axios';

// another libs

// auth store
import useAuthStore from '@/shared/stores/authStore.js'; // Hanya impor store-nya

const apiURL = process.env.NEXT_PUBLIC_SERVER_API_URL;

// state management
let requestQueue = []; // store a pending request for new refresh token
let isRefreshing = false; // state for code refreshing, if an attempt had been made for refreshing new token, store a request in queue to proceed later on

const axiosInterceptor = axios.create({
    baseURL: apiURL,
    withCredentials: true
})

function processQueue(error, token = null) {
    requestQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    requestQueue = []; // Kosongkan antrian setelah diproses
}

axiosInterceptor.interceptors.request.use(async (config) => {
    // check if the current session is a valid one,
    // if valid, insert authorization header to the request
    // if not, update the session and add new token to authorization header
    // if (!useAuthStore.getState().session?.access_token) await useAuthStore.getState().fetchSession(); // fetch sessio jika tidak ada token aktif
    config.headers.Authorization = `Bearer ${useAuthStore.getState().session?.access_token}`;
    config.headers.withCredentials = true; // insert access token from session store for request
    return config;
})

axiosInterceptor.interceptors.response.use(
    (response) => { // jika response bebas error, langsung teruskan response
        return response;
    },
    async (error) => {
        /**
         * - check if a refresh token attempt had been made before
         *      - if attempted, store that request in queue to recall later after a new token been made
         * - if not, just execute it immidietly
         * - mark the retry request with _retry = true, so that that request not get into retry loop
         */
        const originalRequest = error?.config; // get the previous requst

        if (error.response?.status === 401 && !originalRequest._retry) { // check if the error cause by invalid token & it is not a retry request
            if (isRefreshing) {
                // if refresh token attempt had been made before, store that request in queRequest
                return new Promise((resolve, reject) => {
                    requestQueue.push({ resolve, reject }); // jika token berhasil di buat, token baru akan melakukan request baru
                })
                    .then(token => { // jika resolve terjadi, token baru akan dibuat untuk requst retry
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInterceptor(originalRequest); // retry request
                    })
                    .catch(err => {
                        Promise.reject(err);
                    })
            }

            isRefreshing = true; // mulai percobaan refresh token
            originalRequest._retry = true; // beri flag retry true untuk request yang memulai refresh token

            try {// refresh token baru
                // ambil token baru dengan cara set session store
                await useAuthStore.getState().fetchSession();
                const newToken = useAuthStore.getState().session?.access_token;
                isRefreshing = false; // mark state that token refresh is successful

                processQueue(null, newToken); // lakukan semua queue retry yang tertunda

                originalRequest.headers.Authorization = `Bearer ${newToken}`; // set access token baru untuk user itu
                return axiosInterceptor(originalRequest); // retry request yang memulai attempt refresh token
            } catch (err) {

                processQueue(err, null);
                isRefreshing = false;

                return Promise.reject(err);

            }
        }
        return error;

    }
)

export default axiosInterceptor;
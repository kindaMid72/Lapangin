import axios from 'axios';
import api from '@/utils/axiosClient/axiosInterceptor.js';
import { exportTraceState } from "next/dist/trace"

async function getCourtsForMicrosites(venueId){

    const data = await api.get(`/courtMicrosite/get_court_info/${venueId}`, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0'
        }
    })
    .then(res => {
        return res.data;
    })
    .catch(err => {
        console.error(err)
    })

    return data;
}

async function getCourtSchedules(venueId, courtId){
    // this function will return:
    /**
     * court availability rules
     */
    const data = null;


    return data;
}

export {getCourtsForMicrosites}
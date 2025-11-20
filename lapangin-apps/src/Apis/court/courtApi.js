import axios from 'axios';
import api from '@/utils/axiosClient/axiosPublicRealtimeInterceptor.js';
import { exportTraceState } from "next/dist/trace"

async function getCourtsForMicrosites(venueId){

    const data = await api.get(`/courtMicrosite/get_court_info/${venueId}`)
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
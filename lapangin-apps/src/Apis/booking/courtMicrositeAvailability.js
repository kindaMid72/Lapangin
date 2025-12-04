// return date exception, taken slotschedules,
// gw mau experiment
// ini di feature-branch
import api from '@/utils/axiosClient/axiosPublicRealtimeInterceptor.js';

async function getSelectedDateException(courtId, date) {
    const isAvailable = await api.get(`/publicAvailability/get_selected_date_exception/${courtId}/${date}`)
        .then(res => {
            return res.data.dateAvailable;
        })
        .catch(err => {
            console.error(err)
        })

    return isAvailable;
}
async function getSlotsForSelectedDate(venueId, courtId, date) {
    const data = await api.get(`/publicAvailability/get_court_schedule_for_selected_date/${venueId}/${courtId}/${date}`)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            console.error(err)
        })

    return data;
}


export {getSelectedDateException, getSlotsForSelectedDate};
export default {getSelectedDateException, getSlotsForSelectedDate};
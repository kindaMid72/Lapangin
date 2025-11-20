// return date exception, taken slotschedules,
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
async function getSlotsForSelectedDate() {
   
}


export {getSelectedDateException};
export default {getSelectedDateException};
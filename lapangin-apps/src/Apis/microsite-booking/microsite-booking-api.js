
import api from '@/utils/axiosClient/axiosPublic.js';
async function initializeBooking({courtId, selectedDate, venueId, selectedSchedule, idenpotenKey}) {
    // const courtId = req.params.courtId;
    // const date = req.params.selectedDate;
    // const venueId = req.params.venueId;
    // let selectedSchedule = req.body.selectedSchedule; // list of start time & end time 
    // const idenpotenKey = req.body.idenpotenKey; // 

    return await api.post(`/microsite_booking/initialize_booking/${venueId}/${courtId}/${selectedDate}`, {
        selectedSchedule: selectedSchedule,
        idenpotenKey: idenpotenKey
    })

}
async function getBookingDetail(venueId, bookingId){
    return await api.get(`/microsite_booking/get_booking/${venueId}/${bookingId}`);
}
async function initializePayment(fd) {
    return await api.post(`/microsite_booking/initialize_payment`, fd, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
async function checkBookingStatus(bookingId){
    return await api.get(`/microsite_booking/check_booking_status/${bookingId}`);
}

export {
    initializeBooking,
    getBookingDetail,
    initializePayment,
    checkBookingStatus
}
export default {
    initializeBooking,
    getBookingDetail,
    initializePayment,
    checkBookingStatus
}
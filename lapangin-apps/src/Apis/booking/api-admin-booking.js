import api from '../../utils/axiosClient/axiosInterceptor.js';
// getter
async function getBookingPage(venueId){ 
    // get the first page based on configuration
    return await api.get(`/admin_booking/get_booking_page/${venueId}`);
}
async function getBookingByLastIndex(){
    // get booking by last index
}
async function getBookingBySearch(){
    // get booking by search
}
async function getDetailBookingById(){
    // get booking by id
}


// setter
async function updateBookingById(){
    // get 
}
async function deleteBookingById(){

}


export default {
    getBookingPage,
    updateBookingById,
    deleteBookingById,
    getBookingByLastIndex
}
export {
    getBookingPage,
    updateBookingById,
    deleteBookingById,
    getBookingByLastIndex
}
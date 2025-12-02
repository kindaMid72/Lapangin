import api from '@/utils/axiosClient/axiosInterceptor.js';


async function createNewPayment(props) {
    await api.post('/admin_payment/create_new_payment',
        props
        , {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
}
async function deletePayment(venueId, paymentId) {
    await api.delete(`/admin_payment/delete_payment/${venueId}/${paymentId}`);
}
async function updatePayment(fd) {
    await api.put(`/admin_payment/update_payment`, 
        fd, 
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
}
async function getAllPayment(venueId) {
    if (!venueId) throw new Error("venueId is required for getAllPayment");
    const { data } = await api.get(`/admin_payment/get_payment/${venueId}`);

    return data;
}

export {
    createNewPayment,
    deletePayment, getAllPayment, updatePayment
};
export default {
    createNewPayment,
    deletePayment,
    updatePayment,
    getAllPayment
};
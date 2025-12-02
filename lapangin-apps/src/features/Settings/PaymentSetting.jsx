'use client'

// imports
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation.js';

// sub-page components
import EditPaymentCard from './EditPaymentPage.jsx';
import NewPaymentCard from './NewPaymentCard.jsx';

// components
import ToggleButton from '../components/ToggleButton';
import EditButton from '../components/EditButton';


// stores
import useVenueStore from '@/shared/stores/venueStore';

// api
import api from '@/Apis/payment/adminPayment.js';



export default function PaymentSetting() {
    const {venue_id} = useParams();


    // state
    const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
    const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
    const [payments, setPayments] = useState([]);

    // stores

    async function fetchData() {
        const data = await api.getAllPayment(venue_id);
        setPayments(data);
    }

    useEffect(() => {
        fetchData();
    }, [])

    // components
    function PaymentSettingCard({ title, description, isActive, onClick , object}) {
        return (<>
            <div className='w-full flex justify-between items-center border-gray-300 dark:border-gray-700 border p-3 rounded-xl'>
                <div>
                    <p className='font-bold text-gray-800 dark:text-gray-100'>{title}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>{description}</p>
                </div>
                <EditButton onClick={() => { setShowEditPaymentModal(object)}}/>
            </div>
        </>)
    }

    return (<>

        {/* TODO: popup message */}

        {showNewPaymentModal && <NewPaymentCard
            onSave={() => { fetchData(); setShowNewPaymentModal(false);}}
            onCancel={() => { setShowNewPaymentModal(false); }}
        />}
        {showEditPaymentModal && <EditPaymentCard
            onSave={() => { fetchData(); setShowEditPaymentModal(false); }}
            onCancel={() => { setShowEditPaymentModal(false); }}
            paymentData={showEditPaymentModal}
        />}

        <div className="p-3 bg-gray-100 dark:bg-gray-800 min-h-screen">
            <div className="rounded-xl bg-white text-black dark:text-white dark:bg-gray-900 p-4">
                <h1 className='text-2xl font-bold p-3'>Pengaturan Pembayaran</h1>
                {/* Payment Methods Section */}
                <div className='flex flex-col justify-between items-center p-3 gap-4'>
                    <h1 className='w-full text-start p-2 text-xl font-semibold'>Metode Pembayaran Aktif</h1>
                    {/* TODO: shot data fetching here  */}
                    {payments && 
                        payments.map(payment => (
                            <PaymentSettingCard
                                key={`${payment.name}${payment.id}`}
                                title={payment.name}
                                description={payment.provider_id}
                                isActive={payment.is_active}
                                onClick={() => { }}
                                object={payment}
                            />
                        ))
                    }
                    <div onClick={() => setShowNewPaymentModal(true)} className='flex justify-center items-center w-full border-gray-400 border-2 border-dashed h-[50px] p-3 rounded-xl bg-transparent hover:bg-green-50 dark:hover:bg-green-900/50 hover:border-green-500 dark:hover:border-green-600 transition-colors duration-150 ease-in-out cursor-pointer'>
                        <p className='text-lg font-semibold text-gray-600 dark:text-gray-400 group-hover:text-green-600'>+ Tambah Metode Pembayaran</p>
                    </div>
                </div>

                {/* <hr className='text-gray-400 my-5' /> */}

                {/* Payment Rules Section
                <div className='flex flex-col justify-between items-center p-4 gap-4'>
                    <h1 className='w-full text-start text-xl font-extrabold'>
                        Opsi Pembayaran
                    </h1>
                    <div className='w-full flex justify-between items-center'>
                        <div>
                            <p className='font-bold'>Otomatis konfirmasi dari payment gateway</p>
                            <p className='font-extralight text-sm'>Konfirmasi pembayaran secara otomatis setelah transaksi berhasil.</p>
                        </div>
                        <ToggleButton isActive={autoConfirm} onClick={() => setAutoConfirm(!autoConfirm)} />
                    </div>
                    <div className='w-full flex justify-between items-center'>
                        <div>
                            <p className='font-bold'>Pelanggan harus bayar DP terlebih dahulu</p>
                            <p className='font-extralight text-sm'>Wajibkan uang muka untuk setiap pemesanan.</p>
                        </div>
                        <ToggleButton isActive={downPayment} onClick={() => setDownPayment(!downPayment)} />
                    </div>
                </div> */}
            </div>
        </div>

    </>

    )
}
'use client'

// imports
import { useState } from 'react';

// components
import ToggleButton from '../components/ToggleButton';


export default function PaymentSetting() {

    // Dummy states for toggles
    const [qrPayment, setQrPayment] = useState(true);
    const [manualTransfer, setManualTransfer] = useState(true);
    const [gopay, setGopay] = useState(true);
    const [ovo, setOvo] = useState(false);
    const [dana, setDana] = useState(true);
    const [autoConfirm, setAutoConfirm] = useState(true);
    const [downPayment, setDownPayment] = useState(false);

    // components
    function PaymentSettingCard({ title, description, isActive, onClick }) {
        return (<>
            <div className='w-full flex justify-between items-center border-gray-500 border-1 p-3 rounded-xl'>
                <div>
                    <p className='font-bold'>{title}</p>
                    <p className='font-extralight text-sm'>{description}</p>
                </div>
                <ToggleButton isActive={isActive} onClick={onClick} />
            </div>
        </>)
    }
 
    return (
        <div className="p-3">
            <div className="rounded-xl bg-gray-300 text-black dark:text-white dark:bg-gray-900 p-4">
                <h1 className='text-2xl font-extrabold p-3'>Pengaturan Pembayaran</h1>
                {/* Payment Methods Section */}
                <div className='flex flex-col justify-between items-center p-3 gap-4 border-gray-500 '>
                    <h1 className='w-full text-start p-2 text-xl font-extrabold'>Metode Pembayaran Aktif</h1>
                    <PaymentSettingCard title={'Pembayaran dengan scan QR code'} description={'Aktifkan pembayaran via QRIS.'} isActive={qrPayment} onClick={() => setQrPayment(!qrPayment)} />
                    <PaymentSettingCard title={'Transfer manual ke rekening venue'} description={'Pelanggan dapat membayar dengan transfer bank manual.'} isActive={manualTransfer} onClick={() => setManualTransfer(!manualTransfer)} />
                    <PaymentSettingCard title={'GoPay, OVO, DANA, dll'} description={'Aktifkan pembayaran melalui e-wallet populer.'} isActive={gopay || ovo || dana} onClick={() => { setGopay(!gopay); setOvo(!ovo); setDana(!dana); }} />
                    <div className=' flex justify-center items-center w-full border-gray-500 border-1 h-[50px] p-3 rounded-xl bg-transparent hover:bg-green-700 hover:border-transparent transition-color duration-100 ease-in-out cursor-pointer'>
                        <p className='text-xl font-extrabold'>+ Tambah Metode Pembayaran</p>
                    </div>
                </div>

                <hr className='text-gray-400 my-5' />

                {/* Payment Rules Section */}
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
                </div>
            </div>
        </div>
    )
}
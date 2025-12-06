'use client'
import { Temporal } from "@js-temporal/polyfill";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// api
import { getBookingDetail, initializePayment } from '@/Apis/microsite-booking/microsite-booking-api.js';

// utils
import numberToRupiah from '@/utils/formatChanger/numberToRupiah.js';

// component
import InputImage from '@/utils/inputTools/UploadImage.jsx';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();


    // state
    const [timeRemain, setTimeRemain] = useState(0);

    // booking data
    const [bookingId, setBookingId] = useState(null);
    const [courtName, setCourtName] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [price, setPrice] = useState(999999);
    const [expireTime, setExpireTime] = useState(0);
    const [bookingStatus, setBookingStatus] = useState('');

    // payment option
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null); // containt selected payment option

    // bookedSlots
    const [bookedSlots, setBookedSlots] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageViewSrc, setImageViewSrc] = useState(null); // State for image overlay

    // file
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // upload state
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [errorUpload, setErrorUpload] = useState(null);


    async function handleFetchingData() {
        // Tambahkan guard clause untuk memastikan params sudah ada
        if (!params.booking_payment || !params.venue_id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getBookingDetail(params.venue_id, params.booking_payment)
                .then(res => {
                    if (res.status >= 400) {
                        return null;
                    }
                    return res.data;
                })
            // bookingDetail: bookingDetail, // id, court_name, venue_id, guest_name, guest_phone, status, price_total, notes, expires_at
            // paymentOption: paymentOption, // id, provider_id, name, type, currency, image_url, account_number
            // selectedBookedSlots: selectedBookedSlots // start_time, end_time

            if (!data) {
                setError("Gagal memuat detail pesanan, mungkin saja sesi sudah tidak aktif. Jika anda merasa ini salah, hubungi penyedia jasa.");
                return;
            }

            const { bookingDetail, paymentOption, selectedBookedSlots } = data;

            // set bookingDetail
            setName(bookingDetail.guest_name);
            setPhone(bookingDetail.guest_phone);
            setNotes(bookingDetail.notes);
            setBookingId(bookingDetail.id);
            setCourtName(bookingDetail.court_name);
            setPrice(bookingDetail.price_total);
            setBookingStatus(bookingDetail.status);
            
            setExpireTime(Temporal.Instant.from(bookingDetail.expires_at));


            // set paymentOption
            setPayments(paymentOption);

            // set bookedSlots
            setBookedSlots(selectedBookedSlots);

        } catch (err) {
            console.error("Failed to fetch booking data, session might expired:",err);
            localStorage.removeItem('booking_id');
            setError("Gagal memuat detail pesanan, mungkin saja sesi sudah tidak aktif, silahkan lakukan booking ulang. Jika anda merasa ini salah, hubungi penyedia jasa.");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        // Definisikan fungsi fetch di dalam useEffect
        handleFetchingData();
    }, [params.booking_payment, params.venue_id]);

    // Timer countdown effect
    useEffect(() => {
        if (!expireTime) return;
        if(bookingStatus !== 'initialized' && bookingStatus !== 'cancelled'){
            // jika kasus booking menunggu confirmation atau sudah ke confir

            return;
        }

        const intervalId = setInterval(() => {
            const remainingMs = expireTime.epochMilliseconds - Temporal.Now.instant().epochMilliseconds;
            if (remainingMs <= 0 ) {
                setTimeRemain(0);
                clearInterval(intervalId);
                // Optionally, you can set an error or redirect here
                setError("Waktu pembayaran telah habis.");
            } else {
                setTimeRemain(remainingMs);
            }
        }, 1000);

        // Cleanup interval on component unmount or when expireTime changes
        return () => clearInterval(intervalId);
    }, [expireTime]);

    // handler
    async function handlePayment() {
        // TODO: get image

        // check input
        if (name === '' || phone === '' || file === null || selectedPayment === null) {
            setErrorUpload('Semua field harus diisi');
            return;
        }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('guest_name', name);
        fd.append('guest_phone', phone);
        fd.append('notes', notes);
        fd.append('booking_id', bookingId);
        fd.append('payment_id', selectedPayment);
        fd.append('venue_id', params.venue_id);

        setLoadingUpload(true);
        setErrorUpload(null);

        await initializePayment(fd)
            .catch(err => {
                setErrorUpload(err);
                console.error(err);
            })
            .finally(() => {
                setLoadingUpload(false);
                handleFetchingData(); // perbarui sesi setelah upload selesai
            })
    }

    // mini components
    function ImageViewerOverlay({ src, onClose }) {
        if (!src) return null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={onClose} // Close on backdrop click
            >
                <div className="relative max-w-3xl w-full p-4  " onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onClose}
                        className="absolute -top-0 -right-0 z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full text-black text-2xl font-bold hover:bg-gray-200 transition"
                        aria-label="Close image viewer"
                    >&times;</button>
                    <img src={src} alt="QRIS Code Preview" className="rounded-lg size-full" />
                </div>
            </div>
        );
    }
    function formatDuration(milliseconds) {
        if (milliseconds <= 0) return "00:00";
        const duration = Temporal.Duration.from({ milliseconds });
        const rounded = duration.round({ largestUnit: 'minute', smallestUnit: 'second' });
        const minutes = String(rounded.minutes).padStart(2, '0');
        const seconds = String(rounded.seconds).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
    function paymentCard(payment) {
        // id, provider_id, name, type, currency, image_url, account_number
        return (
            <div key={payment.id} onClick={() => { setSelectedPayment(payment.id) }} className={`border-2 border-gray-300 hover:border-green-500 ${selectedPayment === payment.id && 'border-green-500'} ${selectedPayment === payment.id && 'bg-green-100'} p-4 rounded-lg flex items-center flex-col cursor-pointer transition`}>
                <div className="flex justify-between w-full items-center">
                    <span className="font-medium">
                        <p className="font-extrabold">{payment.type !== 'Qris' ? payment.type : 'QRIS'}</p>
                        <div>
                            <p className="text-sm">{payment.name}</p>
                            {payment.type !== 'Qris' && <p className="text-sm">{payment.provider_id}: {payment.account_number}</p>}
                            {payment.type === 'Qris' && <p className="text-sm italic text-gray-900/50">{selectedPayment === payment.id ? 'click gambar untuk perbesar' : 'pilih untuk menampilkan QRIS'}</p>}
                            {/* <p>{payment.account_number}</p> */}
                        </div>
                    </span>

                    <i className="fa-regular fa-credit-card text-gray-500"></i>
                </div>

                {payment.type === 'Qris' && selectedPayment === payment.id && // TODO: onclick perbesar gambar
                    <div className="mt-4 w-full"> {/* image section */}
                        <img onClick={() => setImageViewSrc(payment.image_url)} src={payment.image_url} alt={payment.name} className={`rounded-lg cursor-pointer`}></img>
                    </div>}
            </div>
        )
    }

    // Tampilkan state loading atau error
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-white text-gray-800">
                <div className="flex items-center gap-4 p-8 bg-white rounded-lg">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-green-600"></i>
                    <span className="text-2xl font-semibold">Memuat Detail Pesanan...</span>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-white text-gray-800 p-4">
                <div className="text-center bg-red-50 p-8 rounded-xl shadow-lg border border-red-200">
                    <i className="fa-solid fa-circle-exclamation text-5xl text-red-500 mb-4"></i>
                    <h1 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h1>
                    <p className="mt-2 text-gray-600 max-w-md">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-6 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
            {/* Image Viewer Overlay */}
            <ImageViewerOverlay src={imageViewSrc} onClose={() => setImageViewSrc(null)} />

            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="text-center lg:text-left mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Checkout</h1>
                    <p className="mt-2 text-md text-gray-600">Lengkapi data Anda untuk menyelesaikan booking.</p>
                </div>

                {/* Timer Section */}
                <div className={`${bookingStatus === 'confirmed'? 'bg-green-100 border-green-500' : 'bg-amber-100 border-amber-500'} border-l-4 ${bookingStatus === 'confirmed'? 'text-black' : 'text-amber-800'} p-4 rounded-md flex items-center gap-4 mb-8 shadow-sm`}>
                    <i className={bookingStatus === 'confirmed'? "fa-solid fa-check text-2xl text-green-600" : "fa-solid fa-clock fa-spin text-2xl"}></i>
                    <div>
                        {bookingStatus &&
                            <h2 className="font-extrabold">Status Booking: {bookingStatus}</h2>
                        }
                        {
                            bookingStatus === 'initialized' && 
                            <h2 className="font-bold">Selesaikan booking dalam {formatDuration(timeRemain)}</h2>
                        }
                        { 
                            bookingStatus === 'cencelled' &&
                            <p className="text-sm">Booking telah dibatalkan oleh penyedia layanan.</p>
                        }
                        {
                            bookingStatus === 'confirmed' &&
                            <p className="text-sm">Booking telah dikonfirmasi oleh penyedia layanan, simpan booking-ID untuk konfirmasi lanjutan.</p>
                        }
                        {
                            bookingStatus === 'pending' &&
                            <p className="text-sm">Booking sedang menunggu konfirmasi dari penyedia layanan, simpan booking-ID untuk konfirmasi lanjutan.</p>
                        
                        }

                    </div>
                </div>

                {/* Main Content: Two-column layout */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Left Column: Form and Payment */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        {/* Customer Info Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Informasi Pemesan</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input type="text" disabled={bookingStatus === 'confirmed'} id="fullName" value={name} onChange={(e) => { if(bookingStatus !== 'confirmed') setName(e.target.value) }} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition outline-none" placeholder="Masukkan nama lengkap Anda" />
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                    <input type="tel" disabled={bookingStatus === 'confirmed'} id="phoneNumber" value={phone} onChange={(e) => { if(bookingStatus !== 'confirmed') setPhone(e.target.value); }} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition outline-none" placeholder="08XX-XXXX-XXXX" />
                                </div>
                                <div>
                                    <label htmlFor="notes"  className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                    <textarea id="notes" disabled={bookingStatus === 'confirmed'} value={notes} onChange={(e) => {if(bookingStatus !== 'confirmed') setNotes(e.target.value) }} rows="3" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition outline-none" placeholder="Tambah catatan untuk penyedia lapangan..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        {bookingStatus !== 'confirmed' &&
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {payments.map(payment => {
                                        return paymentCard(payment);
                                    })}
                                </div>
                            </div>
                        }

                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-lg shadow-md lg:sticky lg:top-8">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-3">Ringkasan Pesanan</h2>
                            <div className="space-y-3 mt-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lapangan</span>
                                    <span className="font-medium">{courtName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Booking-ID</span>
                                    <span className="font-medium text-xs flex items-center"><p>{bookingId}
                                        <button type={'button'} className=" p-1 rounded-full hover:bg-gray-100 active:bg-gray-100" onClick={() => {
                                            navigator.clipboard.writeText(bookingId); // 
                                        }}><i className="fa-regular fa-copy"></i></button>
                                        </p></span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tanggal</span>
                                    <span className="font-medium">{bookedSlots[0].slot_date}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600">Waktu</span>
                                    <div className="text-right font-medium flex flex-col">
                                        {bookedSlots.map((slot, index) => {
                                            return (
                                                <div key={index}>
                                                    {slot.start_time} - {slot.end_time}
                                                </div>
                                            )
                                        })
                                        }
                                    </div>
                                </div>
                                <hr className="pt-2" />
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal ({bookedSlots.length})</span>
                                    <span className="font-medium">{numberToRupiah(price).split(',')[0]}</span>
                                </div>
                                <hr className="pt-2" />
                                <div className="flex justify-between items-center text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-xl text-green-600">{numberToRupiah(price).split(',')[0]}</span>
                                </div>
                                
                                {
                                    bookingStatus !== 'confirmed' &&
                                    <div className="flex flex-col justify-center gap-2 items-start"> {/** image input section, input payment proof */}
                                        <div>
                                            <label className="px-2 font-semibold !text-gray-900/60">Bukti Pembayaran</label>
                                            <InputImage onProcessed={(processedFile) => {
                                                setFile(processedFile);
                                                setPreview(URL.createObjectURL(processedFile)); // set prev image
                                            }} className={`border-2 ${file ? 'border-green-400 bg-green-100 hover:bg-green-100/60' : 'border-gray-300'} font-extrabold !text-gray-900/40 hover:bg-gray-200/40 transition-color ease-in-out duration-100 cursor-pointer w-full py-2 px-4 rounded-md`} />
                                        </div>
                                        {preview &&
                                            <div onClick={() => setImageViewSrc(preview)}>
                                                <img src={preview} className="rounded-sm"></img>
                                            </div>
                                        }
                                    </div>
                                    
                                }

                            </div>

                            {/* CTA Button */}
                            {
                                bookingStatus !== 'confirmed' &&
                                <div className="mt-6 w-full">
                                    {errorUpload &&
                                        <p className="text-red-500 px-2">{errorUpload}</p>
                                    }
                                    <button onClick={handlePayment} disabled={loadingUpload} className={`w-full  ${loadingUpload ? 'bg-gray-200/60 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'} text-white font-bold py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300`}>
                                        {loadingUpload ? <i className="fa-solid fa-arrows-rotate animate-spin !text-black"></i> : (bookingStatus !== 'confirmed' && bookingStatus !== 'initialized'  ? 'Ubah Bukti Pembayaran' : 'Kirim Bukti Pembayaran')}
                                    </button>

                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
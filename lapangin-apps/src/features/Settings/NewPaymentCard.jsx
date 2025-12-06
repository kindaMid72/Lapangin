
'use client'
// imports
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import InputImage from '@/utils/inputTools/UploadImage.jsx';
import ConfirmationMessage from "../components/ConfirmationMessage";

// apis
import api from '@/Apis/payment/adminPayment.js';

// stores
import useVenueStore from "@/shared/stores/venueStore";

export default function NewPayment({ onCancel, onSave }) {
    const { venue_id } = useParams();

    // stores
    const { activeVenue, venueMetadata, setSelectedVenue } = useVenueStore();

    // state

    const [provider, setProvider] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [currency, setCurrency] = useState('IDR');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [account, setAccount] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Effect to reset file state when type is not Qris
    useEffect(() => {
        if (type !== 'Qris') {
            setFile(null);
            setPreview(null);
        } else {
            console.log(file);
        }
    }, [type]);


    // api

    // handler
    async function handleSubmit() {
        try {
            // check input
            if (name === '' || provider === '' || type === '' || (type === 'Qris' && file === null) || (type !== 'Qris' && account === '')) {
                setError('Semua field harus diisi');
                setShowConfirmation(false);
                return;
            }

            setLoading(true);

            const fd = new FormData();
            fd.append('provider', provider);
            fd.append('name', name);
            fd.append('type', type);
            fd.append('currency', currency);
            fd.append('venueId', activeVenue.venueId || venue_id);
            fd.append('account', account);
            if (file) { // Hanya append jika file bukan null, 
                fd.append('file', file);
            }
            // console.log({fd, file}) // PASS (file terisi sesuai yang seharusnya)
            api.createNewPayment(fd)
                .finally(() => {
                    setLoading(false);
                    onSave();
                })

        } catch (err) {
            console.log(err);

        }
    }

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            {showConfirmation &&
                <ConfirmationMessage
                    title={"Simpan Metode Pembayaran Baru?"}
                    message={"pelanggan anda akan dapat menggunakan opsi pembayaran ini."}
                    onCancel={() => setShowConfirmation(false)}
                    onConfirm={() => { handleSubmit(); }}
                    delayConfirm={true}
                    confirmColor="green"
                    delaySecond={1}
                />
            }
            {/* Floating Card */}
            <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-2xl space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Metode Pembayaran Baru</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tambahkan metode pembayaran untuk transaksi Anda.</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
                        <input type='text' value={provider} onChange={(e) => setProvider(e.target.value)} id="provider" placeholder="nama penyedia layanan" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"></input>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Akun/Kartu</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Contoh: John Doe" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                        <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition">
                            <option className="dark:!text-white !text-black dark:bg-gray-700" value="" disabled>Pilih Tipe</option>
                            <option className="dark:!text-white !text-black dark:bg-gray-700" value="Virtual Account">Virtual Account</option>
                            <option className="dark:!text-white !text-black dark:bg-gray-700" value="E-Wallet">E-Wallet</option>
                            <option className="dark:!text-white !text-black dark:bg-gray-700" value="Credit Card">Kartu Kredit</option>
                            <option className="dark:!text-white !text-black dark:bg-gray-700" value="Transfer Bank">Rekening</option>
                            <option className="dark:!text-white !text-black dark:bg-gray-700" value="Qris">Qris</option>
                        </select>
                    </div>
                    {
                        type !== 'Qris' &&
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Rekening</label>
                            <input type="text" id="name" value={account} onChange={(e) => setAccount(e.target.value)} className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Contoh: John Doe" />
                        </div>
                    }
                    {type === 'Qris' &&
                        <div className="flex justify-between gap-3 items-center w-full ">
                            <div className="w-full">
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700  dark:text-gray-300 mb-1"><i className="fa-solid fa-file-arrow-up"></i> Upload Qris</label>
                                {/* <input type="file" onChange={(e) => setFile(e.target.files[0])} className=" p-2 bg-transparent dark:bg-gray-100/10 h-20 dark:hover:bg-gray-200/20 cursor-pointer w-fit dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"  /> */}
                                <InputImage
                                    className={'w-full p-2 bg-transparent dark:bg-gray-100/20 dark:hover:bg-gray-100/30 cursor-pointer  dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition'}
                                    onProcessed={(file) => {
                                        setFile(file); // file siap pakai dari input image
                                        setPreview(URL.createObjectURL(file)); // preview gambar
                                    }}
                                />

                            </div>
                            {preview &&
                                <div> {/** preview */}
                                    <img
                                        src={preview}
                                        alt="preview"
                                        className="rounded-xl w-30 overflow-auto"
                                    ></img>
                                </div>
                            }

                        </div>
                    }
                </div>

                {/* Action Buttons */}
                <div>
                    <p className="!text-red-500">{error}</p>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onCancel} disabled={loading} className={`px-4 py-2 cursor-pointer text-sm font-extrabold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${loading ? 'cursor-not-allowed bg-gray-700' : ''}`}>Batal</button>
                    <button disabled={loading} onClick={() => { setShowConfirmation(true); }} className={`px-4 py-2 text-sm cursor-pointer text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-extrabold ${loading ? 'cursor-not-allowed !bg-gray-700' : ''}`}>{loading? <i className="fa-solid fa-arrows-rotate animate-spin"></i> : 'Simpan'}</button>
                </div>
            </div>
        </div>
    );
}
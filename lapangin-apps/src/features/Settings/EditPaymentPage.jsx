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

// components
import ToggleButton from "../components/ToggleButton.jsx";

export default function PaymentEdit({ onCancel, onSave, paymentData }) {
    const { venue_id } = useParams();

    // stores
    const { activeVenue } = useVenueStore();

    // state
    const [provider, setProvider] = useState(paymentData?.provider_id || '');
    const [name, setName] = useState(paymentData?.name || '');
    const [type, setType] = useState(paymentData?.type || '');
    const [account, setAccount] = useState(paymentData.account_number ||'');
    const [currency, setCurrency] = useState(paymentData?.currency || 'IDR');
    const [file, setFile] = useState(null); // For new file upload
    const [isActive, setIsActive] = useState(paymentData?.is_active ?? true);
    const [preview, setPreview] = useState(paymentData?.image_url ? `${paymentData.image_url}` : null); // Show existing image

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const [changeOccured, setChangeOccured] = useState(false);

    // Effect to track if any changes have been made to the form
    useEffect(() => {
        const hasChanged =
            provider !== (paymentData?.provider_id || '') ||
            name !== (paymentData?.name || '') ||
            isActive !== (paymentData?.is_active ?? true) ||
            account !== (paymentData.account_number || '') ||
            file !== null; // Any new file is considered a change
        setChangeOccured(hasChanged);
    }, [provider, name, isActive, file, paymentData, account]);

    // handler
    async function handleSubmit() {
        try {
            // check input
            setShowConfirmation(false);
            if (name === '' || provider === '' || type === '') {
                setError('Semua field harus diisi');
                setShowConfirmation(false);
                return;
            }
            if (type !== paymentData.type) {
                setError('Tipe pembayaran tidak dapat diubah');
                setShowConfirmation(false);
                return;
            }

            setLoading(true);
            const fd = new FormData();
            fd.append('id', paymentData.id);
            fd.append('venueId', venue_id);
            fd.append('isActive', isActive ? 1 : 0)
            fd.append('provider', provider);
            fd.append('name', name);
            fd.append('type', type);
            fd.append('currency', currency);
            fd.append('account', account);
            if (file) { // Hanya append jika file bukan null, 
                fd.append('file', file);
            }

            api.updatePayment(fd)
                .finally(() => {
                    setLoading(false);
                    onSave();
                })

        } catch (err) {
            console.log(err);
        }
    }

    async function handleDelete() {
        try {
            setShowDeleteConfirmation(false);
            setLoading(true);
            setError(null);

            await api.deletePayment(venue_id, paymentData.id)
                .catch(err => {
                    setError(err);
                    console.error(err);
                })

            onSave(); // To trigger a refresh on the parent component
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal menghapus metode pembayaran.');
        } finally {
            setLoading(false);
        }
    }

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            {showConfirmation &&
                <ConfirmationMessage
                    title={"Simpan Perubahan?"}
                    message={"Perubahan pada metode pembayaran akan segera diterapkan."}
                    onCancel={() => setShowConfirmation(false)}
                    onConfirm={handleSubmit}
                    delayConfirm={true}
                    confirmColor="green"
                    delaySecond={1}
                />
            }
            {showDeleteConfirmation &&
                <ConfirmationMessage
                    title={"Hapus Metode Pembayaran?"}
                    message={"Apakah Anda yakin ingin menghapus metode pembayaran ini? Tindakan ini tidak dapat dibatalkan."}
                    onCancel={() => setShowDeleteConfirmation(false)}
                    onConfirm={handleDelete}
                    confirmColor="red"
                    delayConfirm={true}
                    delaySecond={3}
                />
            }
            {/* Floating Card */}
            <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-2xl space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Metode Pembayaran</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perbarui detail metode pembayaran Anda.</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
                        <input type='text' value={provider} onChange={(e) => setProvider(e.target.value)} id="provider" placeholder="Nama penyedia layanan" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Akun/Kartu</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Contoh: John Doe" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                        <p className="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md">{type}</p>
                        <p className="text-xs text-gray-400 mt-1">Tipe pembayaran tidak dapat diubah.</p>
                    </div>
                    {type !== 'Qris' &&
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Rekening</label>
                            <input type="text" id="account" value={account} onChange={(e) => setAccount(e.target.value)} className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="2342 24524 2422" />
                        </div>
                    }
                    <div className="flex justify-between items-center pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Aktif</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Nonaktifkan jika metode ini tidak lagi digunakan.</p>
                        </div>
                        <ToggleButton isActive={isActive} onClick={() => setIsActive(!isActive)} />
                    </div>
                    {type === 'Qris' &&
                        <div className="flex justify-between gap-3 items-center w-full ">
                            <div className="w-full">
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><i className="fa-solid fa-file-arrow-up"></i> Ganti Qris</label>
                                <InputImage
                                    className={'w-full p-2 bg-transparent dark:bg-gray-100/20 dark:hover:bg-gray-100/30 cursor-pointer dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition'}
                                    onProcessed={(processedFile) => {
                                        setFile(processedFile);
                                        setPreview(URL.createObjectURL(processedFile));
                                    }}
                                />
                            </div>
                            {preview &&
                                <div>
                                    <img src={preview} alt="Qris Preview" className="rounded-xl w-24 h-24 object-cover" />
                                </div>
                            }
                        </div>
                    }
                </div>

                {/* Action Buttons */}
                <div>
                    <p className="!text-red-500">{error}</p>
                </div>
                <div className="flex justify-between items-center pt-4">
                    <button onClick={() => setShowDeleteConfirmation(true)} disabled={loading} className="px-4 py-2 text-sm font-extrabold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {loading ? 'Loading...' : 'Hapus'}
                    </button>
                    <div className="flex gap-4">
                        <button onClick={onCancel} disabled={loading} className={`px-4 py-2 text-sm font-extrabold text-gray-700 dark:text-gray-300 cursor-pointer bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${loading ? 'cursor-not-allowed bg-gray-700' : ''}`}>Batal</button>
                        <button disabled={loading || !changeOccured} onClick={() => setShowConfirmation(true)} className={`px-4 py-2 text-sm text-white cursor-pointer ${!changeOccured || loading ? 'cursor-not-allowed bg-gray-500/40 !text-gray-300/40' : 'bg-green-600 hover:bg-green-500'} rounded-lg font-extrabold transition-colors `}>{loading ? <i className="fa-solid fa-arrows-rotate animate-spin"></i> : 'Simpan'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

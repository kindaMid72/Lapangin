'use client'


// imports
import { useEffect, useState } from "react";
import { useParams, useRouter} from "next/navigation";

// components

// libs
import api from '@/utils/axiosClient/axiosInterceptor.js';

// stores
import useVenueStore from "@/shared/stores/venueStore";
import ToggleButton from "../components/ToggleButton";


export default function VanueSetting() {
    const { activeVenue, venueMatadata, setSelectedVenue, getVenueMetadata } = useVenueStore();
    const {venue_id, user_id} = useParams();

    // state
    const [isLoading, setLoading] = useState(false);

    const [name, setName] = useState( ''); // fetch from database for all initial vanue credentials
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [timezone, setTimezone] = useState('');

    const allTimezones = Intl.supportedValuesOf('timeZone');

    const [changeOccured, setChangeOccured] = useState(false); // track changes and enable save button if changes occured

    // handler
    useEffect(() => {
        if (venueMatadata) {
            // set state to the venueMatadata that been fetch before
            // (name, slug, phone, address, description, is_active)
            setName(venueMatadata?.name ?? '');
            setAddress(venueMatadata?.address ?? '');
            setPhone(venueMatadata?.phone ?? '');
            setEmail(venueMatadata?.email ?? '');
            setDescription(venueMatadata?.description ?? '');
            setIsActive(venueMatadata?.is_active ?? '');
            setTimezone(venueMatadata?.timezone ?? 'Asia/Jakarta');
            
            setLoading(false);
            return;
        }else{
            setLoading(true);
            getVenueMetadata(); // this will assign venueMetadata from data that been fetch from the database
        }
    }, [venueMatadata])

    // watch for changes
    useEffect(() => {
        if (venueMatadata && (
            name !== (venueMatadata?.name ?? '') ||
            address !== (venueMatadata?.address ?? '') ||
            phone !== (venueMatadata?.phone ?? '') ||
            email !== (venueMatadata?.email ?? '') ||
            description !== (venueMatadata?.description ?? '') ||
            isActive !== (venueMatadata?.is_active ?? '')) ||
            timezone !== (venueMatadata?.timezone ?? '')
        ){
            setChangeOccured(true);
        }else{
            setChangeOccured(false);
        }
    }, [name, address, phone, email, description, isActive, venueMatadata, timezone]);

    async function handleSubmit() {
        try{
            setLoading(true);
            await api.post(`/venue/update_venue_info/${activeVenue.venueId || venue_id}`, {
                name: name,
                address: address,
                phone: phone,
                email: email,
                description: description,
                is_active: isActive,
                timezone: timezone
            }).then(res => {
                getVenueMetadata(); // trigger update for venue metadata, this also will trigger update in the page
                setChangeOccured(false);
                setLoading(false);
            })
        }catch(err){
            console.log(err);
        }
    }


    return (
        <>
        <div className="flex justify-center items-center">
            <div className="w-full p-6 bg-gray-100 dark:bg-gray-900 m-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <i className="fa-solid fa-store"></i>
                    <input onChange={(e) => { setName(e.target.value); }} value={name} placeholder="Nama Usaha Anda" className="outline-1 rounded-lg p-1 min-w-[10ch] outline-gray-500" style={{ widht: name.length + 'ch' }}></input>
                </h2>

                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-map-location-dot mt-1"></i>
                        <div className="w-fit">
                            <p className="font-semibold">Alamat Lengkap</p> {/* min length 5ch  */}
                            <input onChange={(e) => { setAddress(e.target.value); }} value={address} style={{ width: address?.length + 'ch' }} className="outline-1 rounded-lg p-1 min-w-[10ch] outline-gray-500"></input>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-phone mt-1"></i>
                        <div>
                            <p className="font-semibold">Nomor Telepon</p>
                            <input type='tel' onChange={(e) => { setPhone(e.target.value); }} value={phone} style={{ width: phone?.length + 'ch' }} className="outline-1 rounded-lg p-1 min-w-[10ch] outline-gray-500"></input>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-envelope mt-1"></i>
                        <div>
                            <p className="font-semibold">Email</p>
                            <input type='email' onChange={(e) => { setEmail(e.target.value); }} value={email} style={{ width: email?.length + 'ch' }} className="min-w-[10ch] outline-1 rounded-lg p-1 outline-gray-500"></input>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-location-dot mt-1"></i>
                        <div>
                            <p className="font-semibold">Timezone</p>
                            <select value={timezone} onChange={(e) => { setTimezone(e.target.value); }}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-fit h-fit p-2.5 dark:bg-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                                {allTimezones.map(tz => (
                                    <option className="bg-gray-900 text-white" key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-circle-info mt-1"></i>
                        <div className="w-full">
                            <p className="font-semibold">Deskripsi Venue</p>
                            <textarea onChange={(e) => { setDescription(e.target.value) }} value={description} className="h-auto w-full outline-1 rounded-lg p-1 outline-gray-500">
                            </textarea>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-3"> {/* isActive session */}
                        <div className="flex gap-3">
                            <i className="fa-solid fa-circle-check mt-1"></i>
                            <p className="font-semibold inline">Status Venue</p>
                        </div>
                        <div className="flex gap-4 items-center pl-8">
                            <ToggleButton isActive={isActive} onClick={() => setIsActive(!isActive)} /> <p className={isActive ? 'text-green-600' : 'text-red-600'}>{isActive ? 'Aktif' : 'Tidak Aktif'}</p>
                        </div>
                    </div>

                    <div className="p-2 w-full flex justify-end"> {/* this section will watch for changes, if changes occured, serve a save option */}
                        <button type="button" onClick={handleSubmit}  disabled={name?.length > 0 && address?.length > 0 && phone.length > 0 && email.length > 0 ? false : true && changeOccured} className={changeOccured? "px-3 bg-green-600 text-white text-[1.2em] rounded-lg font-extrabold hover:bg-green-700 cursor-pointer transition-color duration-100" : "px-3 bg-gray-600 text-white text-[1.2em] rounded-lg font-extrabold cursor-no-drop transition-color duration-100"}>{isLoading? 'Loading...' : 'Save'}</button>
                    </div>
                </div>
            </div>

        </div>
        </>
    );
};

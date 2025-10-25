'use client'


// imports
import React, { useState, useEffect, use } from "react";

export default function VanueSetting() {

    // state
    const [name, setName] = useState('Lapangan ABC'); // fetch from database for all initial vanue credentials
    const [address, setAddress] = useState('Jl. Sudirman No. 123, Jakarta Selatan');
    const [phone, setPhone] = useState('+0908358242');
    const [email, setEmail] = useState('info@lapanganabc.com'); // default value is the initial value after vanue creation
    const [deskription, setDescription] = useState('');

    // handler
    /**
     * 1. Before save, make sure all value didnt empty and save
     * 2. ...
     */


    return (
        <div className="flex justify-center items-center">
        <div className="w-full p-6 bg-gray-100 dark:bg-gray-900 m-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <i className="fa-solid fa-store"></i>
                <input onChange={(e) => {setName(e.target.value); }} value={name} placeholder="Nama Usaha Anda" className="outline-1 rounded-lg p-1 min-w-[10ch] outline-gray-500" style={{widht: name.length + 'ch'}}></input>
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-map-location-dot mt-1"></i>
                    <div className="w-fit">
                        <p className="font-semibold">Alamat Lengkap</p> {/* min length 5ch  */}
                        <input onChange={(e) => {setAddress(e.target.value); }} value={address} style={{width: address.length + 'ch'}} className="outline-1 rounded-lg p-1 min-w-[10ch] outline-gray-500"></input>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-phone mt-1"></i>
                    <div>
                        <p className="font-semibold">Nomor Telepon</p>
                        <input type='tel' onChange={(e) => {setPhone(e.target.value); }} value={phone} style={{width: phone.length + 'ch'}} className="outline-1 rounded-lg p-1 min-w-[10ch] outline-gray-500"></input>    
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-envelope mt-1"></i>
                    <div>
                        <p className="font-semibold">Email</p>
                        <input type='email' onChange={(e) => {setEmail(e.target.value); }} value={email} style={{width: email.length + 'ch'}} className="min-w-[10ch] outline-1 rounded-lg p-1 outline-gray-500"></input>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-circle-info mt-1"></i>
                    <div className="w-full">
                        <p className="font-semibold">Deskripsi Venue</p>
                        <textarea onChange={(e) => {setDescription(e.target.value)}} value={deskription} className="h-auto w-full outline-1 rounded-lg p-1 outline-gray-500">
                        </textarea>
                    </div>
                </div>

                <div className="p-2 w-full flex justify-end"> {/* this section will watch for changes, if changes occured, serve a save option */}
                    <button disabled={name.length > 0 && address.length > 0 && phone.length > 0 && email.length > 0? false : true} className="px-3 bg-green-600 text-white text-[1.2em] rounded-lg font-extrabold hover:bg-green-700 transition-color duration-100">Save</button>
                </div>
            </div>
        </div>

        </div>
    );
};

'use client'

// imports
import React, {useState, useEffect} from 'react';

export default ({courtName, price = 0}) => {

    // state
    const [currentPrice, setCurrentPrice] = useState(price);
    

    return(<>
    <div>
        <div className='flex flex-col justify-between items-center p-3 dark:bg-gray-900 bg-gray-300 w-full'>
            <div className='flex flex-col w-full flex-wrap justify-evenly gap-2 p-3'>
                <h1 className='font-extrabold text-lg'>{courtName}</h1>
                <div className="flex w-full flex-col flex-wrap justify-evenly gap-2">
                    <div className='flex flex-col flex-1'>
                        <p>Harga</p>
                        <input type='number' value={currentPrice} onChange={(e) => {setCurrentPrice(e.target.value)}} className='outline-1 outline-gray-500 rounded-lg p-1 w-full'></input>
                    </div>
                    <p className='text-gray-400 '>{
                        new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(currentPrice)
                    } /jam</p>
                </div>
            </div>
        </div>
    </div>
    
    </>)
}
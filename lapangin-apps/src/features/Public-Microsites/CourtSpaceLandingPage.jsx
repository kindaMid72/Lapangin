//'use client'

import Link from "next/link";

// api

// component
import CourtViewCard from "@/features/Public-Microsites/components/CourtViewCard.jsx";


export default function PublicCourtSpace({ data, }) {
    console.log('fetched data', data);

    const courtSpace = data.courtSpace;
    const courts = data.courts;

    return (<>
        <div>
            <header className="flex items-start justify-center flex-col p-10 bg-green-900 [&_*]:text-white rounded-bl-3xl" >{/* header */}
                <h1 className="text-3xl font-extrabold py-3">{courtSpace?.name || 'Court Space'} </h1>
                <div className="flex gap-3 flex-wrap justify-start">
                    <h2 className="flex gap-2 items-center justify-around hover:underline cursor-pointer"><i className="fa-solid fa-location-dot"></i><Link href={``}>{courtSpace?.address || 'Address, somewhere idk'}</Link></h2>
                    <h2 className="flex gap-2 items-center justify-around hover:underline cursor-pointer"><i className="fa-solid fa-phone"></i><Link href={``}>{courtSpace?.phone || 'Phone: 08123456789 (no jokowi)'}</Link></h2>
                    <h2 className="flex gap-2 items-center justify-around hover:underline cursor-pointer"><i className="fa-solid fa-envelope"></i><Link href={``}>{courtSpace?.email || 'fufufafa@gmail.com'}</Link></h2>
                </div>
            </header>

            <section className="h-full w-full bg-gray-50  py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-start">
                    <h1 className="text-3xl font-extrabold text-gray-900  sm:text-4xl">Booking Lapangan Sekarang!</h1>
                    <p className="mt-4 text-lg leading-6 text-gray-600 ">Pilih lapangan dan jadwal yang tersedia sesuai kebutuhanmu.</p>
                </div>
                <div className="mt-10 flex flex-wrap justify-center sm:justify-start gap-6">
                    {/** court card goes here */}
                    {courts?.map((court) => {
                        return (
                            <CourtViewCard key={court.id} props={court} />
                        )
                    })}
                </div>
            </section>



        </div>


    </>)
}
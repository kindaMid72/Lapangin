
export default ({namaLapangan, durasiSlot}) => {


    return (<>
        <div className="flex flex-col justify-start border-2 dark:border-gray-700 border-white rounded-xl p-4 dark:bg-gray-900">
            <h2 className="font-extrabold text-lg">{namaLapangan || "Lapangan X"}</h2>
            <h3 className="font-extralight text-sm">Durasi Slot: {durasiSlot || "30"} menit</h3>
            <div className="flex gap-4 mt-3">
                <button className="border-1 border-gray-900 px-3 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg">Edit</button>
                <button className="border-1 border-gray-900 px-3 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg">Atur Jadwal</button>
            </div>
        </div>    
    </>)
}
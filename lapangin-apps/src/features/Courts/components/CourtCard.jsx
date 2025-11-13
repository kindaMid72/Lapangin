
export default ({ court, onEdit, onSchedule }) => {


    return (<>
        <div className="flex flex-col justify-start border-2 dark:border-gray-700 border-white rounded-xl p-4 dark:bg-gray-900">
            <h2 className="font-extrabold text-lg">{court.name || "Lapangan X"}</h2>
            <h3 className="font-extralight text-sm">Durasi Slot: {court.slot_duration_minutes || "30"} menit</h3>
            <div className="flex gap-4 mt-3">
                <button onClick={() => onEdit(court)} className="border-1 cursor-pointer border-gray-900 px-3 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg">Edit</button>
                <button onClick={() => onSchedule(court)} className="border-1 cursor-pointer border-gray-900 px-3 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg">Atur Jadwal</button>
            </div>
        </div>
    </>)
}
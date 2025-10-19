

// components
import CourtCard from "@/features/Courts/components/CourtCard";


export default (props) => {


    return (<>
        <div className="flex items-center justify-between pt-5 px-6 py-3">
            <h1 className="font-bold text-xl flex-1">Kelola Lapangan</h1>
            <button className="border-2 rounded-xl px-3 p-1 bg-green-800  font-extrabold border-transparent hover:bg-green-700 transition-colors duration-300 ease-in-out">+ Tambah Lapangan</button>
        </div>
        <div className="flex justify-start flex-wrap gap-4 m-4">
            <CourtCard/>
            <CourtCard/>
            <CourtCard/>
            <CourtCard/>
            <CourtCard/>
            <CourtCard/>
        </div>
        
    </>)
}
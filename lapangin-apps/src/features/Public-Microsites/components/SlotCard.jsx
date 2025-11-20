export default function SlotCard({onClick, slot}){
    return (
        <div
            onClick={() => { }}
            key={slot.startTimeString}
            className={`p-2 text-center rounded-lg cursor-pointer ${slot.isBooked ? 'bg-orange-600 hover:bg-orange-500' : ''} ${slot.isBlocked ? 'bg-red-800 line-through hover:bg-red-700' : ''} ${slot.isHold ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
            {slot.startTimeString}-{slot.endTimeString}
        </div>
    
    )
}
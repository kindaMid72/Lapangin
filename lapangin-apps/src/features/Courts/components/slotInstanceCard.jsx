


// this component will return a slot that containt start and end hour of a slot
// each slot will have a color indicating its availability (gray-free, yellow-hold(waiting for confirmation),  orange-booked, red-blocked)
export default function SlotCard(color= 'bg-gray-600', startTime, endTime, isBooked, isBlocked, isHold, slotDuration) {
    

    return(<>
    <div className={`h-10 w-20 ${color} rounded-xl flex justify-center items-center text-center`}>
        <div>
            <p>
                {startTime} - {endTime}
            </p>
        </div>
    </div>
    
    
    </>)
}
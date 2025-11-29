// court page

// components
import CourtSheduleSelectionPage from "@/features/Public-Microsites/CourtBookingPage.jsx";

export default async function BookingPage(){
    const data = null; // TODO: bangun api untuk reaquest model data

    return(
        <div className="scrollbar-hide overflow-auto">
            <CourtSheduleSelectionPage  />
        </div>
    )
}
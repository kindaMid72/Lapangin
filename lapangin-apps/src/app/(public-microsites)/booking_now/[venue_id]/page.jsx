
// components
import CourtSpaceLandingPage from '@/features/Public-Microsites/CourtSpaceLandingPage.jsx';

// api
import { getCourtsForMicrosites } from '@/Apis/court/courtApi';

export default async function PublicCourtSpace ({params, searchParams}) {
    const {venue_id} = await params;

    const data = await getCourtsForMicrosites(venue_id);

    return (<div className='w-full min-h-screen bg-gray-100'>
        
        <CourtSpaceLandingPage data={data} />
    
    
    </div>)
}
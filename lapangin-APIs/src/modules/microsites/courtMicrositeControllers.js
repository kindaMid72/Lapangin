import express from 'express';

// utils
import createSupabaseAccess from '../../libs/supabase/admin.js';
import { read } from 'fs';

const route = express.Router();



route.get('/get_court_info/:venueId', async (req, res) => {
    
    /** return info from all court for given venueId 
     *  returned data: 
     *      id, courtName, slotDuration, price(lowerst price), type (jenis lapangan)
     *  only query is_active = true
     *      
    */
    try{
        const venueId = req.params.venueId;

        // this a publicly available resouce, so no need to check for credentials of anything
        const sbAdmin = await createSupabaseAccess();
        
        let {data: courtInfo, error: courtInfoError} = await sbAdmin
            .from('courts')
            .select('id, name, type, slot_duration_minutes, weekday_slot_price, weekend_slot_price')
            .eq('venue_id', venueId)
            .eq('is_active', true);

        if(courtInfoError){
            console.error('error from courtMicrosite: ', courtInfoError)
            return res.sendStatus(500); // internal server error
        }
        courtInfo = courtInfo.map(court => {
            return {
                id: court.id,
                name: court.name,
                type: court.type,
                slotDuration: court.slot_duration_minutes,
                startPrice: Math.min(court.weekday_slot_price, court.weekend_slot_price),
            }
        })

        // fetch CourtSpace info
        // id, name, email, phone, address, timezone
        let {data: courtSpaceInfo, error: courtSpaceInfoError} = await sbAdmin
            .from('venues')
            .select('id, name, email, phone, address, timezone')
            .eq('id', venueId)
            .eq('is_active', true);

        const readyData = {
            courtSpace: courtSpaceInfo[0],
            courts: courtInfo
        }

        return res.status(200).json(readyData); 
    }catch(err){
        console.error('error from courtMicrosite: ', err)
        return res.sendStatus(500); // internal server error
    }
    return 
})


export default route;
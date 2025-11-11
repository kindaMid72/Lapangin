import express from 'express';

// libs
import sbAdmin from '../../libs/supabase/admin.js';
import getUserId from '../../libs/supabase/getUserId.js';

// utils
import createSlug from '../../utils/createSlug.js';


const route = express.Router();

/**
 * FIXME: venueId and venueName didnt match
 */

/** Get all user venues 
 * return all venues(venue_id, role, name) with that user_id
 * body: {}
 */
route.get('/get_all_user_venues', async (req, res) => {
    // validata user and get id
    try{
        const userId = await getUserId(req.headers.authorization);
        if(!userId){
            console.log('from userVenuesController: session not valid');
            return res.status(401).json({message: 'invalid token'});
        }
        const supabase = await sbAdmin();
        let {data: venueInfo, error} = await supabase
            .from('user_venues')
            .select('venue_id, role')
            .eq('user_id', userId);

        if(error){
            console.log('from userVenuesController:', error);
            return res.status(401).json({message: error.message});
        }

        let {data: venueName, error: error2} = await supabase
            .from('venues')
            .select('id, name')
            .in('id', venueInfo.map(item => item.venue_id));

        if(error2){
            console.log('from userVenuesController:', error2);
            return res.status(401).json({message: error2.message});
        }
        
        const data = venueInfo.map((item, index) => { // concat venue_name, venue_id, and role // FIXME: this session trigger error
            item.venue_name = venueName.filter(venue => venue.id === item.venue_id)[0].name;
            return item;
        })

        return res.status(200).json({data: data, message: 'success'});
    }catch(err){
        console.error('from userVenuesControllers: ', err);
        return res.status(500).json({message: 'something went wrong'});
    }

})

export default route;
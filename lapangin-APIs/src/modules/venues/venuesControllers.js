
import getUserId from "../../libs/supabase/getUserId.js";
import sbAdmin from '../../libs/supabase/admin.js';
import express from 'express';

/**
 * FIXME: create new vanue, response with 401
 */
// utils
import createSlug from "../../utils/createSlug.js";

const route = express.Router();

route.post('/create_new_venue', async (req, res) => {
    try{
        // get user_id, then check token
        // 1. create userInstance from authorization headers
        // 2. validate token 
        // 3. get user id
        const userId = await getUserId(req.headers.authorization);
        if(!userId){
            return res.status(401).json({message: 'invalid token'});
        }

        const supabase = sbAdmin();
        /**
         * 1. extract venue info from request
         * 2. create new venue instance
         * 3. connect new venue to users that create that venue by assign it in user_vanues as a 'owner'
         */
    
        // extract data from request
        const vanueName = req.body.vanueName;
        const address = req.body.address;
        const phoneNumber = req.body.phoneNumber;
        const description = req.body.description || "";
        const slug = createSlug(vanueName);
    
        // create new venue instance
        const {data, error} = await supabase // FIXME: error occured somewhere around here
            .from('venues')
            .insert([ // create a venue with a basic initial data
                {name: vanueName, address: address, phone: phoneNumber, description: description, slug: slug, is_active: true} 
            ])
        

        if (error){ // this is debug session, dont erase that clog
            console.log('from venuesController:', error);
            return res.status(401).json({message: error.message});
        }
        return res.status(201).json({message: 'vanue creation success: ' + data})
    }catch(err){
        console.log(err);
        res.status(505).json({message: 'something went wrong'});
    }

})

route.delete('/delete_venue', async (req, res) => {
    const supabase = createUserInstance(req);
    /**
     * 1. 
     */
})

route.get('/get_venue_info', async (req, res) => {
    const supabase = createUserInstance(req);
    /**
     * 1. 
     */
})

export default route;
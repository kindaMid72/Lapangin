
import createUserInstance from "../../libs/supabase/user.js";
import express from 'express';

/**
 * FIXME: create new vanue, response with 401
 */
// utils
import createSlug from "../../utils/createSlug.js";

const route = express.Router();

route.post('/create_new_venue', async (req, res) => {
    try{
        const supabase = createUserInstance(req.headers.authorization);
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
            .select()
        console.log(error);
        if (error){
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
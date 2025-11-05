
import express from 'express';
import sbAdmin from '../../libs/supabase/admin.js';
import getUserId from "../../libs/supabase/getUserId.js";

/**
 * FIXME: create new vanue, response with 401
 */
// utils
import createSlug from "../../utils/createSlug.js";

const route = express.Router();

route.post('/create_new_venue', async (req, res) => {
    try {
        // get user_id, then check token
        // 1. create userInstance from authorization headers
        // 2. validate token 
        // 3. get user id
        const userId = await getUserId(req.headers.authorization);
        if (!userId) {
            return res.status(401).json({ message: 'invalid token' });
        }

        const supabase = await sbAdmin();
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
        const { data, error } = await supabase
            .from('venues')
            .insert([ // create a venue with a basic initial data
                {
                    name: vanueName,
                    address: address,
                    phone: phoneNumber,
                    description: description,
                    slug: slug,
                    is_active: true
                }
            ]).select('id', { count: 'exact' }) // select row that been added at insertion

        if (error) { // this is debug session, dont erase that clog
            console.log('from venuesController:', error);
            return res.status(401).json({ message: error.message });
        }

        console.log(data);
        const newVenueId = data[0]?.id; // data will return array of effected row, this will access the first row (the only row that been returned)
        // send request
        const { data: data2, error: error2 } = await supabase
            .from('user_venues')
            .insert([
                { user_id: userId, venue_id: newVenueId, role: 'owner', invited_by: null, invite_status: 'accepted' }
            ])
        if (error2) {
            console.log('from venuesController:', error2);
            return res.status(401).json({ message: error2.message });
        }

        return res.status(201).json({ message: 'vanue creation success: ' + data })
    } catch (err) {
        console.log(err);
        res.status(505).json({ message: 'something went wrong' });
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

import express from 'express';
import createSupabaseAccess from '../../libs/supabase/admin.js';
import getUserId from "../../libs/supabase/getUserId.js";

/**
 * 
 */
// utils
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';
import createUserInstance from '../../libs/supabase/user.js';

import createSlug from "../../utils/createSlug.js";

const route = express.Router();

route.post('/create_new_venue', async (req, res) => { // PASS
    try {
        // get user_id, then check token
        // 1. create userInstance from authorization headers
        // 2. validate token 
        // 3. get user id
        const userId = await getUserId(req.headers.authorization);
        if (!userId) {
            return res.status(401).json({ message: 'invalid token' });
        }

        const supabase = await createSupabaseAccess();
        /**
         * 1. extract venue info from request
         * 2. create new venue instance
         * 3. connect new venue to users that create that venue by assign it in user_vanues as a 'owner'
         */
        const {data: userInstance, errorUser} = await (await createUserInstance(req.headers.authorization)).auth.getUser();
        if(errorUser) return res.status(403).json({message: errorUser.message});

        // extract data from request
        const vanueName = req.body.vanueName;
        const address = req.body.address;
        const phoneNumber = req.body.phoneNumber;
        const description = req.body.description || "";
        const timezone = req.body.timezone || "Asia/Jakarta";
        const slug = createSlug(vanueName);

        const userName = userInstance.user?.email.split('@')[0];
        const userEmail = userInstance.user?.email;
        const userPhone = null;

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
                    is_active: true,
                    timezone: timezone // new 
                }
            ]).select('id', { count: 'exact' }) // select row that been added at insertion

        if (error) { // this is debug session, dont erase that clog
            console.log('from venuesController:', error);
            return res.status(401).json({ message: error.message });
        }

        const newVenueId = data[0]?.id; // data will return array of effected row, this will access the first row (the only row that been returned)
        // send request
        const { data: data2, error: error2 } = await supabase
            .from('user_venues')
            .insert([
                { 
                    user_id: userId, 
                    venue_id: newVenueId, 
                    role: 'owner', 
                    invited_by: null, 
                    invite_status: 'accepted', 
                    is_active: true, 
                    email: userEmail, 
                    phone: userPhone, 
                    name: userName 
                } // TODO:  add email, name , phone
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

route.get('/get_venue_info/:venueId', async (req, res) => { // PASS
    try {
        const venueId = req.params.venueId;
        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId); // only admin or owner who has access
        if (!userHasAccess) return res.status(401).json({ message: 'access denied, token expired or user didnt have access' })

        // extract data
        // create admin access
        const sbAdmin = await createSupabaseAccess();

        // return venue info (name, slug, phone, address, description, metadata(notyet), is_active)
        const { data: venueData, error: venueFetchError } = await sbAdmin
            .from('venues')
            .select('id, name, slug, phone, address, description, is_active, email, timezone')
            .eq('id', venueId);

        if (venueFetchError) return res.status(400).json({ message: 'something went wrong' });
        return res.status(200).json({ message: 'success', data: venueData[0] });
    } catch (err) {
        console.error('error from venuesControllers: ', err);
        res.status(500).json({ message: 'something went wrong, internal server error' });
    }
    /**
     * 1. 
     */
})

route.post('/update_venue_info/:venueId', async (req, res) => { // PASS
    try {
        const venueId = req.params.venueId;
        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if (!userHasAccess) return res.status(401).json({ message: 'access denied, token expired or user didnt have access' });

        const sbAdmin = await createSupabaseAccess();
        // (name, slug, phone, address, description, metadata(notyet), is_active, email)
        const venueName = req.body.name;
        const slug = createSlug(venueName);
        const phone = req.body.phone;
        const address = req.body.address;
        const description = req.body.description;
        const is_active = req.body.is_active;
        const email = req.body.email;
        const timezone = req.body.timezone ?? 'Asia/Jakarta'; // default value will be jakarta

        const { data: updatedVenue, error: updateVenueError } = await sbAdmin
            .from('venues')
            .update([
                {
                    name: venueName,
                    slug: slug,
                    phone: phone,
                    address: address,
                    description: description,
                    is_active: is_active,
                    email: email,
                    timezone: timezone // this is new
                }
            ])
            .eq('id', venueId);
        if (updateVenueError) return res.status(400).json({ message: 'something went wrong' });


        return res.status(200).json({ message: 'success' }); // return success status
    } catch (err) {
        console.error('error from venueController: ', err);
        return res.status(500).json({ message: 'something went wrong, internal server error? idk either' });
    }
})

export default route;
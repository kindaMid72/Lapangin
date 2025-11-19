import { Temporal } from '@js-temporal/polyfill';
import express from 'express';

// libs
import sbAdmin from '../../libs/supabase/admin.js';
import getUserId from '../../libs/supabase/getUserId.js';
import createUserInstance from '../../libs/supabase/user.js';

// utils


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
    try {
        const userId = await getUserId(req.headers.authorization);
        if (!userId) {
            console.log('from userVenuesController: session not valid');
            return res.status(401).json({ message: 'invalid token' });
        }
        const supabase = await sbAdmin();
        let { data: venueInfo, error } = await supabase
            .from('user_venues')
            .select('venue_id, role')
            .eq('user_id', userId);

        if (error) {
            console.log('from userVenuesController:', error);
            return res.status(401).json({ message: error.message });
        }

        let { data: venueName, error: error2 } = await supabase
            .from('venues')
            .select('id, name')
            .in('id', venueInfo.map(item => item.venue_id));

        if (error2) {
            console.log('from userVenuesController:', error2);
            return res.status(401).json({ message: error2.message });
        }

        const data = venueInfo.map((item, index) => { // concat venue_name, venue_id, and role // FIXME: this session trigger error
            item.venue_name = venueName.filter(venue => venue.id === item.venue_id)[0].name;
            return item;
        })

        return res.status(200).json({ data: data, message: 'success' });
    } catch (err) {
        console.error('from userVenuesControllers: ', err);
        return res.status(500).json({ message: 'something went wrong' });
    }

})

route.get('/get_venue_invites/:email', async (req, res) => {
    //FIXME: response empty, something wrong with the query selector
    try {
        // user pass email & userId from authorization
        const email = req.params.email; // FIXME: email undefined, something wrong here
        const userId = await getUserId(req.headers.authorization);

        const supabase = await sbAdmin();

        // query all invites for given email

        const { data: invites, error: invitesError } = await supabase
            .from('venue_invites')
            .select('role, invited_token, venue_id')
            .eq('invited_email', email)
            .eq('status', 'pending')
            .gt('expires_at', Temporal.Now.instant().toString());
        if (invitesError) return res.status(500).json({ message: 'internal server error, contact support if problem persists' });

        // fetch venue name
        let { data: venueName, error: venueNameError } = await supabase
            .from('venues')
            .select('name, id')
            .in('id', invites.map(item => item.venue_id));
        if (venueNameError) return res.status(500).json({ message: 'internal server error, contact support if problem persists' });
        venueName = venueName.reduce((acc, item) => { // change data format to key value, id: name
            acc[item.id] = item.name;
            return acc;
        }, {});

        // merge the data
        const data = invites.map((item) => {
            item.venue_name = venueName[item.venue_id];
            return item;
        })

        return res.status(200).json({ data: data, message: 'success' });

    } catch (err) {
        console.error('from userVenuesControllers: ', err);
        return res.status(500).json({ message: 'something went wrong, enternal server error' })
    }

})

route.post('/accept_invite/:invitedToken', async (req, res) => {
    try {
        /**
         * 1. token true = user valid
         * 2. get email, create new connection 
         */
        const userClient = await createUserInstance(req.headers.authorization);
        if (!userClient) return res.status(401).json({ message: 'invalid token' });
        const supabase = await sbAdmin();

        const invitedToken = req.params.invitedToken;

        // Dapatkan data pengguna dengan benar
        const { data: { user }, error: userError } = await userClient.auth.getUser();
        if (userError || !user) {
            return res.status(401).json({ message: 'Invalid user session.' });
        }
        const email = user.email;
        const userId = user.id;

        // check if the user make the request is the user who belong to the token, and the token is valid
        const { data: inviteData, error: checkTokenError } = await supabase
            .from('venue_invites')
            .select('role, venue_id')
            .eq('invited_token', invitedToken)
            .eq('invited_email', email)
            .eq('status', 'pending')
            .single(); // Gunakan .single() untuk memastikan hanya satu baris yang cocok

        if (checkTokenError || !inviteData) {
            return res.status(403).json({ message: 'This invitation is not valid or has expired.' });
        }

        
        // if token is valid, create connection userId venue
        const { error: userVenueConnectionError } = await supabase
            .from('user_venues')
            .insert({
                user_id: userId,
                venue_id: inviteData.venue_id,
                role: inviteData.role,
                invited_by: null,
                invite_status: 'accepted',
                is_active: true,
                email: email,
                phone: null,
                name: user.user_metadata?.name || email.split('@')[0] // Gunakan nama dari metadata atau default dari email
            })
        if (userVenueConnectionError) return res.status(500).json({ message: 'internal server error, contact support if problem persists' })

        const {error: updateInvitationError} = await supabase
            .from('venue_invites')
            .update({status: 'accepted'})
            .eq('invited_token', invitedToken)
            .eq('invited_email', email);
        if(updateInvitationError) return res.status(402).json({message: 'connection created but failed to update token status'});

        return res.status(200).json({ message: 'success' });

    } catch (err) {
        console.error('from userVenuesControllers: ', err);
        return res.status(500).json({ message: 'something went wrong, enternal server error' });
    }
})

route.get('/check_invite', async (req, res) => {
    try{
        const userInstance = await createUserInstance(req.headers.authorization);
        if(!userInstance) return res.status(401).json({message: 'invalid token'});

        const supabase = await sbAdmin();

        // extract email from userInstance

        const {data: {user}, error: userError} = await userInstance.auth.getUser();
        const email = user.email;
        
        const {data: thereInvite, error: thereInviteError} = await supabase
            .from('venue_invites')
            .select('role, venue_id')
            .eq('invited_email', email)
            .eq('status', 'pending');
        console.log(thereInvite);
        
        if(thereInviteError) {
            console.error('error from userVenues', thereInviteError);
            return res.status(500).json({message:'internal server error, contact support if problem persists'});}

        const result = thereInvite.length > 0;

        return res.status(200).json({message: 'success', result: result});
    }catch(err){
        console.error('error from uservenue', err);
        return res.status(500).json({message: 'something went wrong, enternal server error'});
    }
})

route.put('/reject_invite/:invitedToken', async (req, res) => {
    try {
        /**
         * 1. token true = user valid
         * 2. set token to rejected
         */
        const userClient = await createUserInstance(req.headers.authorization);
        if (!userClient) return res.status(401).json({ message: 'invalid token' });
        const supabase = await sbAdmin();

        const invitedToken = req.params.invitedToken;

        // Dapatkan data pengguna dengan benar
        const { data: { user }, error: userError } = await userClient.auth.getUser();
        if (userError || !user) {
            return res.status(401).json({ message: 'Invalid user session.' });
        }
        const email = user.email;
        const userId = user.id;

        // check if the user make the request is the user who belong to the token, and the token is valid
        const { data: inviteData, error: checkTokenError } = await supabase
            .from('venue_invites')
            .select('role, venue_id')
            .eq('invited_token', invitedToken)
            .eq('invited_email', email)
            .eq('status', 'pending')
            .single(); // Gunakan .single() untuk memastikan hanya satu baris yang cocok

        if (checkTokenError || !inviteData) {
            return res.status(403).json({ message: 'This invitation is not valid or has expired.' });
        }

        // if token is valid, set the prev token to be 'rejected'
        const { error: updateError } = await supabase
            .from('venue_invites')
            .update({ status: 'rejected' })
            .eq('invited_token', invitedToken)
            .eq('invited_email', email)
            .eq('status', 'pending')
        if(updateError){ 
            console.error('from uservenues: ', updateError);
            return res.status(500).json({message: 'internal server error, contact support if problem persists'});
        }
        return res.status(200).json({ message: 'success' });

    } catch (err) {
        console.error('from userVenuesControllers: ', err);
        return res.status(500).json({ message: 'something went wrong, enternal server error' });
    }
})

export default route;
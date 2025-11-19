import { Temporal } from '@js-temporal/polyfill';
import express from 'express';


// imports 
import createSupabaseAccess from '../../libs/supabase/admin.js';
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';

// utils
import generateRandomToken from '../../utils/authTools/generateRandomToken.js';


const route = express.Router();

/** TODO: 
 * 1. get all user management analytics data (admin based access)
 * 2. get all all user for given venueId (admin based access)
 * 3. post add new member, send invitation by email or display invitation in venue selection page (admin based access)
 * 4. put edit user access, change (name, contact, role, bergabung, status)
 * 6. delete user 
 */

route.get('/get_team/:venueId', async (req, res) => {
    try {
        // indentifier & data
        const venueId = req.params.venueId;
        // check user access (admin access)
        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if (!userHasAccess) return res.status(401).json({ Message: 'Unauthorized access, either user didnt have access or user didnt eligible in this resource' })

        const sbAdmin = await createSupabaseAccess();

        // perform data fetching
        let { data: allMemberData, error: getAllMemberDataError } = await sbAdmin
            .from('user_venues')
            .select('user_id, role, invited_by, is_active, phone, name, email, created_at', { count: 'exact' })
            .eq('venue_id', venueId);
        if (getAllMemberDataError) {
            console.error(getAllMemberDataError);
            return res.status(403).json({ message: 'data fetching error, place try again, or contact support' })
        }

        // config data for total mamber, total active, total non-active
        const totalMember = allMemberData.length
        const totalActive = allMemberData.filter(member => member.is_active).length
        const totalNonActive = allMemberData.filter(member => !member.is_active).length
        const formattedMemberData = allMemberData.map(({ created_at, ...member }) => ({
            ...member,
            join_at: Temporal.Instant.from(created_at).toString()
        }));

        return res.status(200).json({
            data: {
                totalMember,
                totalActive,
                totalNonActive,
                allMemberData: formattedMemberData
            }
        })
    } catch (err) {
        console.log('error from teamControllers: ', err)
        return res.status(500).json({ message: 'internal server error, contact support if problem persists' })
    }
})

route.post('/invite_member/:venueId', async (req, res) => {
    try {
        /**
         * 1. authenticate user request, admin level access
         * 2. if auth  
         *      - store venue_invites (invited_email, role, token, status: 'pending', expires_at (10 day))
         * 3. 
         */

        // extract data
        const venueId = req.params.venueId;
        const email = req.body.email;
        const role = req.body.role;
        const token = generateRandomToken();

        // check user access
        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if (!userHasAccess) return res.status(401).json({ message: 'request denied, either user token expired or user didnt have access' })
        const sbAdmin = await createSupabaseAccess();

        // 1. Ambil waktu sekarang sebagai Instant
        const expiresIn = Temporal.Now.instant().toZonedDateTimeISO('UTC').add({ days: 10 }).toString().split('[')[0];

        // first, check if the user already exist in venue team, if so, forbid the request
        const { count: emailAlreadyExist, error: checkEmailError } = await sbAdmin
            .from('user_venues')
            .select('email', { count: 'exact', head: true })
            .eq('venue_id', venueId)
            .eq('email', email);
        if (emailAlreadyExist > 0) return res.sendStatus(403);

        // delete all existing request (unique email, venue_id), and send a new valid one (only one invitation valid can be send for each venue_user at a time)
        const { error: deleteError } = await sbAdmin
            .from('venue_invites')
            .delete()
            .eq('venue_id', venueId)
            .eq('invited_email', email);
        if (deleteError) {
            console.error(deleteError);
            return res.status(500).json({ message: 'internal server error, contact support if problem persists' });
        }

        // perform data insertion
        const { error: storeInviteError } = await sbAdmin
            .from('venue_invites')
            .insert({
                venue_id: venueId,
                invited_email: email,
                status: 'pending', // initial state
                role: role,
                invited_token: token,
                expires_at: expiresIn // make sure its containt the right format
            })
        if (storeInviteError) {
            console.error(storeInviteError);
            return res.sendStatus(500);
        }

        return res.status(201).json({ message: 'invitation sent successfully!' })
    } catch (err) {
        console.error('error from teamControllers: ', err);
        return res.status(500).json({ message: 'internal server error, contact support if problem persists' })
    }
});

route.put('/update_member/:venueId/:email', async (req, res) => {
    try {
        // indentifier
        const venueId = req.params.venueId;
        const email = req.params.email;
        if(!email || !venueId) return res.status(400).json({message: 'bad request'});

        const newName = req.body.name;
        const newRole = req.body.role;
        const newPhone = req.body.phone;
        const newIsActive = req.body.isActive;

        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if (!userHasAccess) return res.status(401).json({ message: 'access denied, either user token expired or user didnt have access' });

        // check if update can be done, 
        /**
         * 1. if there only 1 admin or owner, and they want to change roles, forbid the request
         * 2. if there only 1 admin or owner, adn they want to innactivate that user, forbit the request
         */

        const sbAdmin = await createSupabaseAccess();
        // perform data for checking

        // check check if the target is the user who requested them self
        // if so, forbid a request if user try to remove access (if there is only on admin)

        // if ((newRole !== 'owner' && newRole !== 'admin') || newIsActive === false) { // if they want to change roles from admin or owner to 'member'
        //     const { data: activeAdminData, error: checkError } = await sbAdmin
        //         .from('user_venues')
        //         .select('email')
        //         .eq('venue_id', venueId)
        //         .eq('email', email)
        //         .eq('is_active', true)
        //         .in('role', ['admin', 'owner']);

        //     if (activeAdminData.length <= 1 && activeAdminData[0].email === email) { // if the target user is the only one admin or member in the venue, revoke the request
        //         return res.status(403).json({ message: 'unable to update this member.' });
        //     }

        // }
        if(newIsActive === false || newRole === 'staff' || newRole === 'member'){ // jika update mengharuskan update is_active, check apakah update mungkin untuk dilakukan
            const {data: activeAdmin, error: activeAdminError} = await sbAdmin // PASS
                .from('user_venues')
                .select('email')
                .eq('venue_id', venueId)
                .eq('is_active', true)
                .in('role', ['admin', 'owner']);
                if(activeAdminError) return res.status(500).json({message: 'internal server error, contact support if problem persists'})
                if(activeAdmin.length <= 1 && activeAdmin[0].email === email) return res.status(403).json({message: 'unable to update this member.'});
        }

        // perform data update
        const { error: updateError } = await sbAdmin
            .from('user_venues')
            .update({
                name: newName,
                role: newRole,
                phone: newPhone,
                is_active: newIsActive
            })
            .eq('venue_id', venueId)
            .eq('email', email);
        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ message: 'internal server error, contact support if problem persists' })
        }

        return res.status(200).json({ message: 'success' });
    } catch (err) {
        console.error('error from teamControllers: ', err);
        return res.status(500).json({ message: 'internal server error, contact support if problem persists' })
    }
})

route.delete('/delete_member/:venueId/:email', async (req, res) => {
    try {
        // indentifier
        const venueId = req.params.venueId;
        const email = req.params.email;


        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if (!userHasAccess) return res.status(401).json({ message: 'access denied, either user token expired or user didnt have access' });

        const sbAdmin = await createSupabaseAccess();
        // perform data for checking
        // make sure there other admin in the venues (admin, owner > 1)

        // check if the targeted user is the only admin or owner in the venue, if so, forbid the request
        const { data: activeAdminData, error: checkError } = await sbAdmin
            .from('user_venues')
            .select('email')
            .eq('venue_id', venueId)
            .eq('is_active', true)
            .in('role', ['admin', 'owner']);
        if (checkError) return res.status(500).json({ message: 'internal server error, contact support if problem persists' })
        // if there only one admin/owner & the targeted user the requester it self, forbid the request
        if (activeAdminData.length <= 1 && activeAdminData[0].email === email) { // if the target user is the only one admin or member in the venue, revoke the request
            return res.status(403).json({ message: 'unable to update this member.' });
        }


        // perform data update
        const { error: deleteError } = await sbAdmin
            .from('user_venues')
            .delete()
            .eq('venue_id', venueId)
            .eq('email', email);
        if (deleteError) {
            console.error(deleteError);
            return res.status(500).json({ message: 'internal server error, contact support if problem persists' })
        }

        return res.status(200).json({ message: 'success' });
    } catch (err) {
        console.error('error from teamControllers: ', err);
        return res.status(500).json({ message: 'internal server error, contact support if problem persists' })
    }

})

route.post('/accept_invite/:venueId/:token', async (req, res) => {
    try{
        
    }catch(err){
        console.error('error from teamControllers', err);
        return res.status(500).json({message: 'internal server error, contact support if problem persists'});
    }

})
export default route;
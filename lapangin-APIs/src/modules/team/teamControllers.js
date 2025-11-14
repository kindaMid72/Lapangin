import { Temporal } from '@js-temporal/polyfill';
import express from 'express';


// imports 
import createSupabaseAccess from '../../libs/supabase/admin.js';
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';

// utils

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

route.put('/update_member/:venueId/:email', async (req, res) => {
    try{
        // indentifier
        const venueId = req.params.venueId;
        const email = req.params.email;
        
        const newName = req.body.name;
        const newRole = req.body.role;
        const newPhone = req.body.phone;
        const newIsActive = req.body.isActive;

        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if(!userHasAccess) return res.status(401).json({message: 'access denied, either user token expired or user didnt have access'});

        // check if update can be done, 
        /**
         * 1. if there only 1 admin or owner, and they want to change roles, forbid the request
         * 2. if there only 1 admin or owner, adn they want to innactivate that user, forbit the request
         */

        const sbAdmin = await createSupabaseAccess();
        // perform data for checking
        if((newRole !== 'owner' && newRole !== 'admin') || newIsActive === false){ // if they want to change roles from admin or owner to 'staff'
            // make sure there other admin in the venues (admin, owner > 1)
            const {count: adminCount, error: adminCountError} = await sbAdmin
                .from('user_venues')
                .select('role', {count: 'exact', head: true})
                .eq('venue_id', venueId)
                .in('role', ['admin', 'owner'])
                .eq('is_active', true)
            console.log('jumlah admin', adminCount);
            if(adminCount <= 1) return res.status(403).json({message: 'unable to update this member.'})
        }

        // perform data update
        const {error: updateError} = await sbAdmin
            .from('user_venues')
            .update({
                name: newName, 
                role: newRole, 
                phone: newPhone, 
                is_active: newIsActive
            })
            .eq('venue_id', venueId)
            .eq('email', email);
        if(updateError) {
            console.error(updateError);
            return res.status(500).json({message: 'internal server error, contact support if problem persists'})
        }

        return res.status(200).json({message: 'success'});
    }catch(err){
        console.error('error from teamControllers: ', err);
        return res.status(500).json({message: 'internal server error, contact support if problem persists'})
    }
})

route.delete('/delete_member/:venueId/:email', async (req, res) => {
    try{
        // indentifier
        const venueId = req.params.venueId;
        const email = req.params.email;
        

        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if(!userHasAccess) return res.status(401).json({message: 'access denied, either user token expired or user didnt have access'});

        const sbAdmin = await createSupabaseAccess();
        // perform data for checking
        // make sure there other admin in the venues (admin, owner > 1)

        // check if deleted user already innactive, if so, just delete them immidietely
        const {data: targetMember, error: targetMemberError} = await sbAdmin
            .from('user_venues')
            .select('is_active')
            .eq('venue_id', venueId)
            .eq('email', email);
        if(targetMemberError) {
            console.error(targetMemberError);
            return res.status(500).json({message: 'internal server error, contact support if problem persists'});
        }
        // if user is active, perform pollicies, other wise, just pass pollicies test
        // this mean that target member is unimmuned to set unauthorized to given venue
        if(targetMember[0].is_active){
            // restriction pollicies
            const {count: adminCount, error: adminCountError} = await sbAdmin
                .from('user_venues')
                .select('role', {count: 'exact', head: true})
                .eq('venue_id', venueId)
                .in('role', ['admin', 'owner'])
                .eq('is_active', true)
            if(adminCount <= 1 ) return res.status(403).json({message: 'unable to update this member.'})
        }

        // perform data update
        const {error: deleteError} = await sbAdmin
            .from('user_venues')
            .delete()
            .eq('venue_id', venueId)
            .eq('email', email);
        if(deleteError) {
            console.error(deleteError);
            return res.status(500).json({message: 'internal server error, contact support if problem persists'})
        }

        return res.status(200).json({message: 'success'});
    }catch(err){
        console.error('error from teamControllers: ', err);
        return res.status(500).json({message: 'internal server error, contact support if problem persists'})
    }

})
export default route;
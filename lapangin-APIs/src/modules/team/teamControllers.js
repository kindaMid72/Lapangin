import express from 'express';

// imports 
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';
import checkUserAccess from '../../middlewares/auth/checkUserAccess.js';
import createSupabaseAccess from '../../libs/supabase/admin.js'

// utils
import createSlug from '../../utils/createSlug.js';
import isValidTimestamptz from '../../utils/checker/isTimeStamptz.js';

const route = express.Router();

/** TODO: 
 * 1. get all user management analytics data (admin based access)
 * 2. get all all user for given venueId (admin based access)
 * 3. post add new member, send invitation by email or display invitation in venue selection page (admin based access)
 * 4. put edit user access, change (name, contact, role, bergabung, status)
 * 6. delete user 
 */

route.get('/get_team/:venueId', async (req, res) => {
    try{
        // indentifier & data
        const venueId = req.params.venueId;
        // check user access (admin access)
        const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
        if(!userHasAccess) return res.status(401).json({Message: 'Unauthorized access, either user didnt have access or user didnt eligible in this resource'})
        
        const sbAdmin = await createSupabaseAccess();
    
        // perform data fetching
        const {data: allMemberData, error: getAllMemberDataError} = await sbAdmin
            .from('user_venues')
            .select('user_id, role, invited_by, is_active', {count: 'exact'})
            .eq('venue_id', venueId);
            if(getAllMemberDataError) return res.status(403).json({message: 'data fetching error, place try again, or contact support'})
        // config data for total mamber, total active, total non-active
        const totalMember = allMemberData.length
        const totalActive = allMemberData.filter(member => member.is_active).length
        const totalNonActive = allMemberData.filter(member => !member.is_active).length
    
        return res.status(200).json({
            data: {
                totalMember,
                totalActive,
                totalNonActive,
                allMemberData: allMemberData
            }
        })
    }catch(err){
        console.log('error from teamControllers: ',err)
        return res.status(500).json({message: 'internal server error, contact support if problem persists'})
    }
})



export default route;
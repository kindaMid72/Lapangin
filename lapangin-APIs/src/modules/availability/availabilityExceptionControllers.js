import express from 'express';

import createSupabaseAccess from '../../libs/supabase/admin.js';
import checkUserAccess from '../../middlewares/auth/checkUserAccess.js';

/**
 * FIXME: exception trigger multiple data insertion
 */

const route = express.Router();

// set entry point down here
route.post('/get_selected_date_exception', async (req, res) => {
    try {
        // req.body: venue_id, court_id, date
        const venueId = req.body.venue_id;
        const hasAccess = checkUserAccess(req.headers.authorization, venueId);
        if (!hasAccess) return res.status(401).json({ message: 'Unauthorized, either token expired or user didnt have access' });

        const sbAdmin = await createSupabaseAccess();

        // extract date, check availability exception for that day
        const checkDate = req.body.date; // year/month/day
        const courtId = req.body.court_id;
        const { data: exceptions, error: exceptionError } = await sbAdmin
            .from('availability_exceptions')
            .select('reason, is_closed')
            .eq('court_id', courtId)
            .eq('date', checkDate)
        if (exceptionError) console.error('error from availabilityException: ', exceptionError);;
        //console.log(exceptions[0]); // undefined if no row returned

        return res.status(200).json({data: exceptions[0]});

    } catch (err) {
        console.error('error from availabilityException: ', err);
        return res.status(500).json({ message: err.message });
    }
})
route.post('/upsert_selected_date_exception', async (req, res) => {
    try {
        // req.body: venue_id(auth), court_id, date, is_closed
        const venueId = req.body.venue_id;
        const hasAccess = checkUserAccess(req.headers.authorization, venueId);
        if (!hasAccess) return res.status(401).json({ message: 'Unauthorized, either token expired or user didnt have access' });

        const sbAdmin = await createSupabaseAccess();

        // extract date, check availability exception for that day
        const checkDate = req.body.date;
        const courtId = req.body.court_id;
        const isClosed = req.body.is_closed;
        const reason = req.body.reason ?? ''; // reason must be a string
        const { error: exceptionError } = await sbAdmin
            .from('availability_exceptions') // FIXME: insert multiple row (unattended)
            .upsert([ 
                {
                    court_id: courtId,
                    date: checkDate,
                    is_closed: isClosed,
                    reason: reason
                }
            ], {
                onConflict: ['court_id, date']
            })
        if (exceptionError) console.error('error from availabilityException: ', exceptionError);

        return res.status(200).json({ message: `update for ${checkDate} success` });

    } catch (err) {
        console.error('error from availabilityException: ', err);
        return res.status(500).json({ message: err.message });
    }
})


export default route;

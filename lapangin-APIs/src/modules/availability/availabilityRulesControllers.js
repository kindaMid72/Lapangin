import express from 'express';

import { Temporal } from '@js-temporal/polyfill';
// utils
import createAdminInstance from '../../libs/supabase/admin.js';

const route = express.Router();

// TODO: api request goes here


route.get('/get_selected_date_exception/:courtId/:date', async (req, res) => {
    try {
        // this is a public request, there for, anyone can make a request to this endpoint
        /**
         * body:
         * - date (string)
         * - venueId (num)
         * - courtId
         */
        const date = req.params.date; // no need to convert date to utc format, db store it in a plain date without convertion to UTC timezone
        const courtId = req.params.courtId;

        const sbAdmin = await createAdminInstance();

        /**
         * return:
         * dateException == true (not avail) -> return false, otherwise, return true
         */
        const { count: exceptions, error: exceptionError } = await sbAdmin
            .from('availability_exceptions')
            .select('is_closed', { count: 'exact', head: true })
            .eq('court_id', courtId)
            .eq('is_closed', true)
            .eq('date', date)// is a string format, no need to 

        if (exceptionError) {
            console.error('error from availabilityException db: ', err);
            return res.sendStatus(500);
        }
        return res.status(200).json({ dateAvailable: exceptions === 0 })

    } catch (err) {
        console.error('error from availabilityException: ', err);
        return res.status(500).json({ message: err.message });
    }
})




export default route;
import express from 'express';

const route = express.Router();

// auth
import createSupabaseAccess from '../../libs/supabase/admin.js';
import checkUserAccess from '../../middlewares/auth/checkUserAccess.js';
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';

// utils
import getDayIndex from '../../utils/getDayIndex.js'; // start on monday



// set entry point
route.post('/get_court_availability_for_given_date', async (req, res) => {
    // slot_instance for that day (return timeframe where slots is not free)
    try {
        const courtId = req.body.courtId;
        const date = req.body?.date; // Menggunakan 'date' sesuai kiriman frontend
        const dayIndex = getDayIndex(date);
        const venueId = req.body.venueId; // jangan typo yah kontol

        const hasAccess = await checkUserAccess(req.headers.authorization, venueId);
        if (!hasAccess) return res.status(401).json({ message: 'Unauthorized, either token expired or user didnt have access' });

        const sbAdmin = await createSupabaseAccess();

        const { data: slotDuration, error: getSlotDurationError } = await sbAdmin
            .from('slot_templates')
            .select('slot_duration_minutes')
            .eq('court_id', courtId);
        if (getSlotDurationError) return res.status(400).json({ message: 'something went wrong' });

        const { data: nonAvailableSlots, error: getNonAvailableSlotsError } = await sbAdmin
            .from('slot_instances')
            .select('start_time, end_time, status')
            .eq('court_id', courtId)
            .neq('status', 'free')
            .eq('slot_date', date); // FIXME: error here
        if (getNonAvailableSlotsError) return res.status(400).json({ message: 'something went wrong' });
        console.log(nonAvailableSlots);

        const { data: courtOpenCloseTime, error: courtOpenCloseTimeError } = await sbAdmin
            .from('availability_rules')
            .select('open_time, close_time')
            .eq('court_id', courtId)
            .eq('day_of_week', dayIndex);
        if (courtOpenCloseTimeError) return res.status(400).json({ message: 'something went wrong' });

        return res.status(200).json({
            message: 'fetch success',
            data: {
                slotDurationMinutes: slotDuration[0].slot_duration_minutes,
                nonAvailableSlots: nonAvailableSlots,
                openTime: courtOpenCloseTime[0].open_time,
                closeTime: courtOpenCloseTime[0].close_time
            }
        });

    } catch (err) {
        console.error('error from slotAvailability: ', err);
        return res.status(500).json({ message: 'something went wrong' });
    }

})

route.post('/testing', async (req, res) => {
    try {
        // return open and close time for court on a given date (extract daysName, then return the close and open time)
        const venueId = req.body?.venue_id;
        const courtId = req.body?.court_id;

        const userHasAccess = await checkUserAccess(req.headers.authorization, venueId);
        if (!userHasAccess) return res.status(401).json({ message: 'access denied, token expired or user didnt have access' });

        const sbAdmin = await createSupabaseAccess();

        // request goes here

    } catch (err) {
        console.error('error from slotAvailability: ', err);
        return res.status(500).json({ message: 'something went wrong' });
    }

})

export default route;
import express from 'express';

const route = express.Router();

// imports
import { Temporal } from '@js-temporal/polyfill';

// auth
import createSupabaseAccess from '../../libs/supabase/admin.js';
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';
import checkUserAccess from '../../middlewares/auth/checkUserAccess.js';

// utils
import isTimeStamptz from '../../utils/checker/isTimeStamptz.js';
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

        // get slot duration
        const { data: slotDuration, error: getSlotDurationError } = await sbAdmin
            .from('slot_templates')
            .select('slot_duration_minutes')
            .eq('court_id', courtId);
        if (getSlotDurationError) return res.status(400).json({ message: 'something went wrong' });

        // get non-available schedule, return utc timestamptz, convert it to venue time zone
        let { data: nonAvailableSlots, error: getNonAvailableSlotsError } = await sbAdmin
            .from('slot_instances')
            .select('start_time, end_time, status, id')
            .eq('court_id', courtId)
            .neq('status', 'free')
            .eq('slot_date', date); 
        if (getNonAvailableSlotsError) return res.status(400).json({ message: 'something went wrong' });

        // convert timezone to venue timezone, first, get the zonetime for that venueId
        const { data: courtSpaceTimeZone, error: courtSpaceTimeZoneError } = await sbAdmin 
            .from('venues')
            .select('timezone')
            .eq('id', venueId);
            if(courtSpaceTimeZoneError){
                console.error('from slotavail: ', courtSpaceTimeZoneError);
                return res.sendStatus(500);
            }

            nonAvailableSlots.forEach(slot => {
                slot.start_time = Temporal.Instant.from(slot.start_time)
                                    .toZonedDateTimeISO(courtSpaceTimeZone[0].timezone)
                                    .toString().split('[')[0];
                slot.end_time = Temporal.Instant.from(slot.end_time)
                                    .toZonedDateTimeISO(courtSpaceTimeZone[0].timezone)
                                    .toString().split('[')[0];
            })

        // get open close time
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

route.post('/insert_new_court_schedule', async (req, res) => {
    try {
        // return open and close time for court on a given date (extract daysName, then return the close and open time)
        const venueId = req.body?.venueId;
        const courtId = req.body?.courtId;
        const status = req.body?.status;
        const startTime = req.body?.startTime; // timestamptz, zone set to venue timezone
        const endTime = req.body?.endTime; // timestamptz, zone set to venue timezone
        const slotDate = req.body?.slotDate

        const userHasAccess = await checkUserAccess(req.headers.authorization, venueId); // this is staff base access
        if (!userHasAccess) return res.status(401).json({ message: 'access denied, token expired or user didnt have access' });

        const sbAdmin = await createSupabaseAccess();
        // console.log('reqboyd', req.body);
        // console.log('status, ', !(status === 'free' || status === 'booked' || status === 'blocked' || status === 'held'));
        // console.log('start end time', !startTime || !endTime);
        // console.log(!isTimeStamptz(startTime));
        // console.log('input test: ', !startTime || !endTime || 
        //     !(status === 'free' || status === 'booked' || status === 'blocked' || status === 'held') ||
        //     !isTimeStamptz(startTime) || !isTimeStamptz(endTime)); // ada yang salah di sinji

        // check input format
        if(!startTime || !endTime || 
            !(status === 'free' || status === 'booked' || status === 'blocked' || status === 'held') ||
            !isTimeStamptz(startTime) || !isTimeStamptz(endTime) // check if the date format is false
        ) return res.status(400).json({message: 'invalid input format'})
        // console.log(req.body);
        // request goes here

        // console.log(startTime.split('[')[0], endTime.split('[')[0]);
        const {data,  error: setNewAvailabilityError } = await sbAdmin
            .from('slot_instances')
            .insert([
                {
                    court_id: courtId,
                    start_time: startTime.split('[')[0], // make sure date string that been passed is in timestamptz format
                    end_time: endTime.split('[')[0],
                    status: status,
                    slot_date: slotDate // venue timezone date
                }
            ]).select();
            // console.log('data been insert in slot_instances: ', data);
        if(setNewAvailabilityError) {
            console.error('error from slotAvailability: ', setNewAvailabilityError);
            return res.status(400).json({message: 'something went wrong while inserting new shedules'});
        }

        return res.status(200).json({message: 'success'});


    } catch (err) {
        console.error('error from slotAvailability: ', err);
        return res.status(500).json({ message: 'something went wrong' });
    }

})

route.put('/update_court_schedule/:venueId/:scheduleId',async (req, res) => {
    try{
        // identifier
        const venueId = req.params?.venueId;
        const scheduleId = req.params?.scheduleId;
        // data
        const status = req.body?.status;
        const startTime = req.body?.startTime.split('[')[0]; // timestamptz,
        const endTime = req.body?.endTime.split('[')[0]; // timestamptz,
        const startInstant = Temporal.Instant.from(startTime);
        const endInstant = Temporal.Instant.from(endTime);

        // check input
        if(!isTimeStamptz(req.body.startTime) || !isTimeStamptz(req.body.endTime)){
            return res.status(400).json({message: 'invalid input format'});
        } 
        if((
            !startTime || !endTime || !(status === 'held' || status === 'free' || status === 'booked' || status === 'blocked') || (Temporal.Instant.compare(startInstant, endInstant) >= 0))
        ){ // check if startTime < endTime
            return res.status(400).json({message: 'invalid input format'});
        }
        
        // check user access, this is staff based access
        const userHasAccess = await checkUserAccess(req.headers.authorization, venueId);
        if(!userHasAccess) return res.status(401).json({message: 'access denied, token expired or user didnt have access'});

        const sbAdmin = await createSupabaseAccess(); // create supabase access
        const {error: updateScheduleError, data: updatedSchedule} = await sbAdmin
            .from('slot_instances')
            .update({
                start_time: startTime,
                end_time: endTime,
                status: status
            })
            .eq('id', scheduleId);
        if(updateScheduleError) {
            console.error('error from slotAvailability, updateScheduleError: ', updateScheduleError);
            return res.status(400).json({message: 'something went wrong'})
        }

        return res.status(200).json({message: 'success'});
        
    }catch(err){
        console.error('error from slotAvailability: ', err);
        return res.status(500).json({ message: 'something went wrong' });
    }
})

route.delete('/delete_court_schedule/:venueId/:scheduleId', async (req, res) => {
    try{
        // idenfitier 
        const venueId = req.params.venueId;
        // data
        const scheduleId = req.params.scheduleId;

        // check user access
        const userHasAccess = await checkUserAccess(req.headers.authorization, venueId);
        if(!userHasAccess) return res.status(400).json({message: 'access denied, token expired or user didnt have access'});

        const sbAdmin = await createSupabaseAccess();

        const {error: deleteScheduleError, data: deletedSchedule} = await sbAdmin
            .from('slot_instances')
            .delete()
            .eq('id', scheduleId);
        if(deleteScheduleError) return res.status(403).json({message: 'insert new schedules failed'})

        return res.status(200).json({message: 'success'});

    }catch(err){
        console.error('error from slotAvailability: ', err);
        return res.status(500).json({ message: 'something went wrong' });
    }
})

export default route;
import express from 'express'; 

import { Temporal } from '@js-temporal/polyfill';
// utils
import createAdminInstance from '../../libs/supabase/admin.js';
import getDayIndex from '../../utils/getDayIndex.js';

// checker
import checkValidDate from '../../utils/checker/checkValidDate.js';
import isValidTimestamptz from '../../utils/checker/isTimestamptz.js';
import isValidDate from '../../utils/checker/checkValidDate.js';

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

route.get('/get_existing_schedules/:venueId/:courtId/:date', async (req, res) => { // TODO:FIXME: jangan pakai ini
    try{
        /**
         * body: venueId (not sure), courtId, date (selected date)
         */
        const courtId = req.params.courtId;
        const date = req.params.date;
        const venueId = req.params.venueId;

        // check input 
        if(!courtId || !date ) return res.sendStatus(400);
        if(!isValidDate(date)) return res.sendStatus(400);

        const sbAdmin = await createAdminInstance();
        /**
         * TODO: 
         * - get venue time zone
         * - get startTime & endTime of that selected day
         * - 
         */
        const { data: venueTimezone, error: timezoneError } = await sbAdmin
            .from('venues')
            .select('timezone')
            .eq('id', venueId)
        if (timezoneError) return res.sendStatus(500);

        const timezone = venueTimezone[0].timezone;
        const startTime = Temporal.PlainDate.from(date)
                            .toPlainDateTime()
                            .toZonedDateTime(timezone)
                            .toString().split('[')[0];
        const endTime = Temporal.PlainDate.from(date)
                            .toPlainDateTime()
                            .toZonedDateTime(timezone).add({ days: 1})
                            .toString().split('[')[0];

        // query database base on startTime & endTime
        let { data: schedules, error: scheduleError } = await sbAdmin 
            .from('slot_instances')
            .select('id, slot_date, start_time, end_time, status, blocked_reason, expires_at')
            .eq('court_id', courtId)
            .gte('start_time', startTime)
            .lt('end_time', endTime)
            if(scheduleError){
                console.error('error from slot_instances: ', scheduleError);
                return res.sendStatus(500);
            }
            schedules = schedules.filter(slot => {
                if(slot.status === 'held'){
                    const now = Temporal.Now.instant();
                    const current = Temporal.Instant.from(slot.expires_at);
                    if(!current) return true;
                    // check if expires at already passed
                    return Temporal.Instant.compare(now, current) < 0;
                }
                return true;
            })


        return res.status(200).json({data: schedules});

    }catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
})

route.get('/get_court_schedule_for_selected_date/:venueId/:courtId/:date', async (req, res) => {
    /** 
     * params: venueId, courtId, date
     * 
     * return: slot_instances(existing schedules, timezone setted)
     *  ** this is a public request, anyone can make a request **  
     */
    const venueId = req.params.venueId;
    const courtId = req.params.courtId;
    const date = req.params.date;

    // create admin access
    const sbAdmin = await createAdminInstance();

    // get timezone
    const {data: courtSpaceTimezone, error: courtSpaceTimezoneError} = await sbAdmin
        .from('venues')
        .select('timezone')
        .eq('id', venueId)
        .eq('is_active', true);
        if(courtSpaceTimezoneError){
            console.error('error from courtMicrosite', courtSpaceTimezoneError)
            return res.sendStatus(400)
        }
    const timezone = courtSpaceTimezone[0].timezone;

    // get court schedules
    let {data: courtSchedules, error: courtSchedulesError} = await sbAdmin
        .from('slot_instances')
        .select('id, start_time, end_time, status, expires_at')
        .eq('court_id', courtId)
        .eq('slot_date', date);
        if(courtSchedulesError){
            console.error('error from courtMicrosite', courtSchedulesError)
            return res.sendStatus(400)
        }
        courtSchedules = courtSchedules.filter(slot => {
            if(slot.status === 'held'){
                const now = Temporal.Now.instant();
                const current = Temporal.Instant.from(slot.expires_at);
                if(!current) return true;
                // check if expires at already passed
                return Temporal.Instant.compare(now, current) < 0;
            }
            return true;
        })

        // set timezone to courtSchedules
        courtSchedules.forEach( schedule => {
            schedule.start_time = Temporal.Instant.from(schedule.start_time).toZonedDateTimeISO(timezone).toString().split('[')[0];
            schedule.end_time = Temporal.Instant.from(schedule.end_time).toZonedDateTimeISO(timezone).toString().split('[')[0];

        })
    
    let price = 99999999999;
    const {data:priceForThatDay, error: priceForThatDayError} = await sbAdmin
        .from('courts')
        .select('weekday_slot_price, weekend_slot_price')
        .eq('id', courtId);

        const dayIndex = getDayIndex(date);
        if(dayIndex > 4) price = priceForThatDay[0].weekend_slot_price;
        else price = priceForThatDay[0].weekday_slot_price

    // get selected date start & end time for slot generation
    let { data: dayAvailability, error: dayAvailabilityError } = await sbAdmin
        .from('availability_rules')
        .select('open_time, close_time')
        .eq('court_id', courtId)
        .eq('day_of_week', dayIndex);
    
        if(dayAvailabilityError){
            console.error('error from courtMicrosite', dayAvailabilityError)
            return res.sendStatus(400)
        }
    // test some
    // get slot duration
    const { data: slotDuration, error: slotDurationError } = await sbAdmin
        .from('courts')
        .select('slot_duration_minutes')
        .eq('id', courtId);
        if(slotDurationError) {
            console.error(slotDurationError);
            return res.sendStatus(500);
        }
    

    return res.status(200).json({
        courtSchedules: courtSchedules, 
        openTime: dayAvailability[0].open_time, 
        closeTime: dayAvailability[0].close_time,
        slotDuration: slotDuration[0].slot_duration_minutes,
        timezone: timezone,
        price: price
    });

})


export default route;
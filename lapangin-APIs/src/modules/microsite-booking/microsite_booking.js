import express from 'express';

import createSupabaseAccess from '../../libs/supabase/admin.js';
import { Temporal } from '@js-temporal/polyfill';

// utils
import checkValidDate from '../../utils/checker/checkValidDate.js';
import getDayIndex from '../../utils/getDayIndex.js';

const route = express.Router();
/**
 * TODO:
 * 1. create booking after slot selection, check slot availbility first
 */

route.post('/initialize_booking/:venueId/:courtId/:date', async (req, res) => {
    try{
        // this is a public request, anyone can make a request
        /** TODO:
         * req: selected_schedule (timestamptz string utc), selected date, court_id, venue_id
         * do:
         * - check if there any idepotenkey exist TODO:
         * - check selectedDate === schedules, shedules timeframe valid?
         * - check selected schedule for given date & court_id
         * - get price from date
         * - get total price
         * - if valid, create a bookings instance
         * - create slots hold 
         * - create connection bookings & slot_instance
         * - get bookings: ID 
         * return: 
         * - bookings: ID
         */

        const courtId = req.params.courtId;
        const date = req.params.date;
        const venueId = req.params.venueId;
        let selectedSchedule = req.body.selectedSchedule; // list of start time & end time 
        const idenpotenKey = req.body.idenpotenKey; // 

        // 

        const expiresAt = Temporal.Now.instant().add({minutes: 10}); // expires date
        // input checking
        // TODO: debug
        console.log(req.body);
        // check valid date
        if(!checkValidDate(date)) {
            console.log('invalid date', date);
            return res.sendStatus(400);
        }
        // check if schedule match the date
        const sbAdmin = await createSupabaseAccess();
        // check idepotency key
        const {data: idepotencyKey, error: idepotencyKeyError} = await sbAdmin
            .from('bookings')
            .select('idempotency_key')
            .eq('idempotency_key', idenpotenKey);
            if(idepotencyKeyError){ 
                console.log('error from microsite booking', idepotencyKeyError);
                return res.sendStatus(400);
            }
            if(idepotencyKey.length > 0) return res.sendStatus(403);
        

        // get slot duration
        const {data:slotDurationMinutes, error: slotDurationMinutesError} = await sbAdmin
            .from ('courts')
            .select('slot_duration_minutes')
            .eq('id', courtId);
            if(slotDurationMinutesError) {
                console.log('error from microsite booking', slotDurationMinutesError);
                return res.sendStatus(400);
            }
            const slotDuration = slotDurationMinutes[0].slot_duration_minutes;
        // get timezone
        const {data: venueTimezone, error: venueTimezoneError} = await sbAdmin
            .from('venues')
            .select('timezone')
            .eq('id', venueId);
        if(venueTimezoneError) {
            console.log('error from microsite booking: ', venueTimezoneError);
            return res.sendStatus(400);
        }
        const timezone = venueTimezone[0].timezone;
        const checkScheduleDate = selectedSchedule.some(schedule => {
            // check if time frame didnt valid, by checking the slot duration for each slots
            const startTime = Temporal.Instant.from(schedule.startTime);
            const endTime = Temporal.Instant.from(schedule.endTime);
            if(endTime.epochMilliseconds - startTime.epochMilliseconds > slotDuration * 60000 || endTime.epochMilliseconds - startTime.epochMilliseconds <= 0){
                return true; // return true agar request langsung di forbid
            }
            // check if the date of the schedule is the same
            const extractDate = startTime.toZonedDateTimeISO(timezone).toPlainDate().toString();
            return extractDate !== date;
        })
        if(checkScheduleDate){ 
            console.error('request forbidden, ', checkScheduleDate);
            return res.sendStatus(403);
        } // if there any miss match from selected date, forbid request

        // check if schedule is valid (no overlapping with an existing schedules)
        let {data: scheduleForSelectedDate, error: scheduleForSelectedDateError} = await sbAdmin
            .from('slot_instances')
            .select('start_time, end_time, expires_at, status')
            .eq('court_id', courtId)
            .eq('slot_date', date);
            // filter held expires time
            if(scheduleForSelectedDateError) {
                console.error('error from slotAvailability: ', scheduleForSelectedDateError);
                return res.status(500).json({message: 'something went wrong, db query failed'});
            }
            scheduleForSelectedDate = scheduleForSelectedDate.filter(slot => {
                if(slot.status === 'held'){
                    const now = Temporal.Now.instant();
                    const current = Temporal.Instant.from(slot.expires_at);
                    if(!current) return true;
                    // check if expires at already passed
                    return Temporal.Instant.compare(now, current) < 0;
                }
                return true;
            })
            // check overlapping
            const isOverlap = selectedSchedule.some(schedule => {
                const check = scheduleForSelectedDate.some(existingSchedule => {
                    const startInstant = Temporal.Instant.from(existingSchedule.start_time).epochMilliseconds;
                    const endInstant = Temporal.Instant.from(existingSchedule.end_time).epochMilliseconds;
                    const newStartInstant = Temporal.Instant.from(schedule.startTime).epochMilliseconds;
                    const newEndInstant = Temporal.Instant.from(schedule.endTime).epochMilliseconds;
                    return (
                        (newStartInstant < startInstant && newEndInstant > startInstant) || // based on startTime
                        (newStartInstant < endInstant && newEndInstant >= endInstant) || // based on endTime
                        (newStartInstant >= startInstant && newEndInstant <= endInstant) // caught in between startTime & endTime
                    );
                })
                return check;
            })
            if(isOverlap) return res.sendStatus(400); // forbid request if there is an overlap exiting schedule

        // get total price for that slots
        const dayIndex = getDayIndex(date);
        const {data: courtPrice, error: courtPriceError} = await sbAdmin
            .from('courts')
            .select('weekday_slot_price, weekend_slot_price')
            .eq('id', courtId);
        if(courtPriceError){ 
            console.error('microsite-booking error: ',courtPriceError );
            return res.sendStatus(400);
        }
        const price = courtPrice[0][dayIndex > 4 ? 'weekend_slot_price' : 'weekday_slot_price'] * selectedSchedule.length;

        // if no overlap, create booking instance, get ID, else return 400
        const {data: newBooking, error: newBookingError} = await sbAdmin
            .from('bookings')
            .insert([{
                venue_id: venueId,
                guest_name: '',
                guest_phone: '',
                status: 'initialized',
                price_total: price,
                idempotency_key: idenpotenKey,
                notes: '',
                expires_at: expiresAt,
            }])
            .select()
            .single();
        if(newBookingError) {
            console.error('microsite-booking error: ', newBookingError);
            return res.sendStatus(400);
        }
        const bookingId = newBooking.id;
        
        // mark the slot as hold for 10m
        let {data: slotInstances, error: slotInstancesError} = await sbAdmin
            .from('slot_instances')
            .insert([
                ...selectedSchedule.map(schedule => {
                    return {
                        court_id: courtId,
                        slot_date: date,
                        start_time: Temporal.Instant.from(schedule.startTime),
                        end_time: Temporal.Instant.from(schedule.endTime),
                        status: 'held',
                        expires_at: expiresAt,
                    }
                })
            ])
            .select();
        if(slotInstancesError) {
            console.error('microsite-booking error: ', slotInstancesError);
            return res.sendStatus(400);
        }

        // create connection between slot_instances & bookings by booking_slots
        const {error: bookingSlotsError} = await sbAdmin
            .from('booking_slots')
            .insert([
                ...selectedSchedule.map((schedule, index) => {
                    return {
                        booking_id: bookingId,
                        slot_instance_id: slotInstances[index].id,
                    }
                })
            ])
        if(bookingSlotsError){ 
            console.error('microsite-booking error: ', bookingSlotsError);
            return res.sendStatus(400);
        }
        // return booking ID for further task
        return res.status(200).json({bookingId: bookingId}); 
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})


export default route;
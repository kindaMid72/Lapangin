import express from 'express';

import createSupabaseAccess from '../../libs/supabase/admin.js';
import { Temporal } from '@js-temporal/polyfill';
import multer from 'multer';

// utils
import checkValidDate from '../../utils/checker/checkValidDate.js';
import getDayIndex from '../../utils/getDayIndex.js';

const route = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Konfigurasi multer untuk menyimpan file di memori


const URL_AGE = 60 * 60 * 24 * 365 * 10; // 10 years
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

route.get('/get_booking/:venueId/:bookingId', async (req, res) => {
    // req: bookingId, venueId
    // res: booking detail, venue-payment-option, selectedBookedSlots
    const bookingId = req.params.bookingId;
    const venueId = req.params.venueId;

    const sbAdmin = await createSupabaseAccess();

    // get booking detail
    let {data: bookingDetail, error: bookingDetailError} = await sbAdmin
        .from('bookings')
        .select('id, venue_id, guest_name, guest_phone, status, price_total, notes, expires_at')
        .eq('id', bookingId)
        .eq('venue_id', venueId)
        .single();
        // if booking didnt yet got payed (status === initialized) check if this booking id still valid, by checking the expires_at
        if(bookingDetailError){
            return res.sendStatus(404);
        }
        const now = Temporal.Now.instant();
        const current = Temporal.Instant.from(bookingDetail.expires_at);
        if(bookingDetail.status === 'initialized' && Temporal.Instant.compare(now, current) > 0) return res.sendStatus(404); // return 404, meaning booking session is no longer valid

    // get payment option   
    const {data: paymentOption, error: paymentOptionError} = await sbAdmin
        .from('venue_payments')
        .select('id, provider_id, name, type, currency, image_url, account_number')
        .eq('venue_id', venueId)
        .eq('is_active', true);
        if(paymentOptionError){ 
            console.error('microsite-booking error: ', paymentOptionError);
            return res.sendStatus(500);
        }
    
    // get selected booked slots id given booking id
    const {data: selectedBookedSlotsId, error: selectedBookedSlotsIdError} = await sbAdmin
        .from('booking_slots')
        .select('slot_instance_id')
        .eq('booking_id', bookingId);
        if(selectedBookedSlotsIdError) {
            console.error('microsite-booking error: ', selectedBookedSlotsIdError);
            return res.sendStatus(500);
        }
    
    // get selected slots start & end time
    let {data: selectedBookedSlots, error: selectedBookedSlotsError} = await sbAdmin
        .from('slot_instances')
        .select('start_time, end_time, court_id, slot_date')
        .in('id', selectedBookedSlotsId.map(slot => slot.slot_instance_id));
        if(selectedBookedSlotsError) {
            console.error('microsite-booking error: ', selectedBookedSlotsError);
            return res.sendStatus(500);
        }
        // get venue timezone
        const {data: venueTimezone, error: venueTimezoneError} = await sbAdmin
            .from('venues')
            .select('timezone')
            .eq('id', venueId);
            if(venueTimezoneError) {
                console.error('error from microsite booking: ', venueTimezoneError);
                return res.sendStatus(400);
            }
            const timezone = venueTimezone[0].timezone;
        // set schedule to venue timezone
        selectedBookedSlots = selectedBookedSlots.map(slot => {
            return {
                ...slot,
                start_time: Temporal.Instant.from(slot.start_time).toZonedDateTimeISO(timezone).toString().split('T')[1].slice(0, 5),
                end_time: Temporal.Instant.from(slot.end_time).toZonedDateTimeISO(timezone).toString().split('T')[1].slice(0, 5),
            }
        })


    const courtId = selectedBookedSlots[0].court_id;
    // get courtName
    const {data: courtName, error: courtNameError} = await sbAdmin
        .from('courts')
        .select('name')
        .eq('id', courtId);
        if(courtNameError){
            console.error('microsite-booking error: ', courtNameError);
            return res.sendStatus(500);
        }

    bookingDetail.court_name = courtName[0].name;

    // get payment by bookingId, return (paymantId, venue_payment_id, status, payment_recipe_url)
    const {data: paymentDetail, error: paymentDetailError} = await sbAdmin
        .from('payments')
        .select('id, venue_payment_id, status, payment_recipe_url')
        .eq('booking_id', bookingId);
    if(paymentDetailError){
        console.error('error from microsite-booking while query payment detail: ', paymentDetailError);
        return res.sendStatus(500);
    }


    return res.status(200).json({
        bookingDetail: bookingDetail, // id, court_name,  venue_id, guest_name, guest_phone, status, price_total, notes, expires_at
        paymentOption: paymentOption, // id, provider_id, name, type, currency, image_url, account_number
        selectedBookedSlots: selectedBookedSlots, // start_time, end_time
        paymentDetail: paymentDetail,
    })


})

route.post('/initialize_payment', upload.single('file'), async (req, res) => {
    try{
        /**
         * req: 
            fd.append('file', file);
            fd.append('guest_name', name);
            fd.append('guest_phone', phone);
            fd.append('notes', notes);
            fd.append('booking_id', bookingId);
            fd.append('payment_id', selectedPayment);
         */
        const bookingId = req.body.booking_id;
        const file = req.file;
        const name = req.body.guest_name;
        const phone = req.body.guest_phone;
        const notes = req.body.notes;
        const selectedPayment = req.body.payment_id;
        const venueId = req.body.venue_id;
        
        const sbAdmin = await createSupabaseAccess();
        // check booking 
        const {data: booking, error: bookingError} = await sbAdmin
            .from('bookings')
            .select('expires_at, status')
            .eq('id', bookingId)
            .eq('venue_id', venueId);
            if(bookingError) {
                console.error('microsite-booking error, at checking booking: ', bookingError);
                return res.sendStatus(500);
            }
            if(booking.length === 0) return res.sendStatus(404);
            if(booking[0].status === 'confirmed'){ // if booking already confirmed, forbid update request
                return res.sendStatus(403);
            }
            if(booking[0].status === 'initialized' && Temporal.Instant.compare(Temporal.Now.instant(), Temporal.Instant.from(booking[0].expires_at)) > 0) return res.sendStatus(404); // return 404, meaning booking session is no longer valid

        // check payment
        const {data: payment, error: paymentError} = await sbAdmin
            .from('venue_payments')
            .select('id')
            .eq('id', selectedPayment)
            .eq('venue_id', venueId)
            .eq('is_active', true);
        if(paymentError) {
            console.error('microsite-booking error, at checking payment: ', paymentError);
            return res.sendStatus(500);
        }
        if(payment.length === 0) return res.sendStatus(403); // forbid request if payment method not valid

        // initialized payment
        // extract image
        const image = file;

        const magic = image.buffer.toString('hex', 0, 8).slice(0, 8);
        const allowedMagic = ['89504e47', 'ffd8ffe0', '52494646']; // png, jpg, riff (webp starts with RIFF)
        if (!allowedMagic.includes(magic)) {
            return res.status(400).json({ error: 'Invalid image file' });
        }
        const ext = (image.originalname.split('.').pop() || 'bin').replace(/\W/g,'');
        const filename = `${Date.now()}-${Math.floor(Math.random()*1e6)}.${ext}`;
        const path = `payment_proof/${venueId}/${filename}`; // akan digunakan untuk query nanti


        // check size before uploading
        if (image.size > 10 * 1024 * 1024) {
            console.error('error from admin payment, file to large');
            return res.sendStatus(400)
        }

        // upload image
        const {data: uploadImage, error: uploadImageError} = await sbAdmin
            .storage
            .from('booking_bucket')
            .upload(path, image.buffer, {
                contentType: image.mimetype,
                upsert: true
            });
        if(uploadImageError) {
            console.error('error from admin payment, failed to upload image: ', uploadImageError);
            return res.sendStatus(500);
        }

        // create image url & metadata
        let {data: imageUrl, error: imageUrlError} = await sbAdmin
            .storage.from('booking_bucket')
            .createSignedUrl(path, URL_AGE);
        if(imageUrlError) {
            console.error('error from admin payment: ', imageUrlError);
            return res.sendStatus(500);
        }
        const image_url = imageUrl.signedUrl;

        // store path & payment_proof metadata in payment
        const imageMetadata = {
            path: path,
            image_url: image_url,
            filename: filename,
            size: image.size,
            mime: image.mimetype
        }
        const {error: createPaymentError} = await sbAdmin
            .from('payments')
            .upsert(
                {
                    booking_id: bookingId,
                    venue_payment_id: selectedPayment,
                    payment_recipe_url: image_url,
                    payment_recipe_metadata: imageMetadata,
                    status: 'initiated',
                },{
                    onConflict: 'booking_id' // jika booking_id sudah ada (payment sudah di inisiasi sebelumnya)
                }
            )
            if(createPaymentError) {
                console.error('error from microsite-booking, insert new payments: ', createPaymentError);
                return res.sendStatus(500);
            }
            

        // set booking status to be 'pending', and update guest info

        const { error: updateBookingError} = await sbAdmin
            .from('bookings')
            .update({
                status: 'pending', // pending for confirmation
                guest_name: name,
                guest_phone: phone,
                notes: notes,
            })
            .eq('id', bookingId)
            .eq('venue_id', venueId);
            if(updateBookingError) {
                console.error('error from microsite-booking: ', updateBookingError);
                return res.sendStatus(500);
            }

        // update booked slot 
        // first get selected slot by booking_id 
        const {data: bookedSlotId,error: bookedSlotIdError} = await sbAdmin // FIXME: ini jadi und
            .from('booking_slots')
            .select('slot_instance_id')
            .eq('booking_id', bookingId)
            if(bookedSlotIdError) {
                console.error('error from microsite-booking: ', bookedSlotIdError);
                return res.sendStatus(500);
            }
        // set the slot status to be booked
        const {error: updateSlotError} = await sbAdmin
            .from('slot_instances')
            .update({
                status: 'booked',
                expires_at: null
            })
            .in('id', bookedSlotId.map(slot => slot.slot_instance_id));
            if(updateSlotError) {
                console.error('error from microsite-booking: ', updateSlotError);
                return res.sendStatus(500);
            }
            
        return res.sendStatus(201);

    }catch(err){
        console.error('error from microsite booking: ', err);
        return res.sendStatus(500);
    } 

})

route.get('check_booking_status/:bookingId', async (req, res) => {
    try{
        // given booking id, check the status and expires
        const bookingId = req.params.bookingId;
        const sbAdmin = await createSupabaseAccess();

        const {data: bookingStatus, error: bookingStatusError} = await sbAdmin
            .from('bookings')
            .select('status, expires_at')
            .eq('id', bookingId);
            if(bookingStatusError) {
                console.error('error from microsite booking: ', bookingStatusError);
                return res.sendStatus(500);
            }

        if(bookingStatus[0].status === 'initialized'){
            const now = Temporal.Now.instant();
            const current = Temporal.Instant.from(bookingStatus[0].expires_at);
            const stillValid = Temporal.Instant.compare(now, current) < 0;

            return res.status(200).json({
                status: bookingStatus[0].status,
                stillValid: stillValid
            })
        }
        
        return res.status(200).json({
            status: bookingStatus[0].status,
            stillValid: true
        })
    }catch(err){

    }
})


export default route;
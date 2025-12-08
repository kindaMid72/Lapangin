import express from 'express';

const route = express.Router();
// staff level access
// middlewares
import checkUserAccess from '../../middlewares/auth/checkUserAccess.js';

// utils
import createAdminInstance from '../../libs/supabase/admin.js';
import { decodeBase64ToObject, encodeObjectToBase64 } from '../../utils/format-changer/encodeDecodeBase64.js';

// implement pagination
route.get('/get_booking_page/:venueId', async (req, res) => {
    /* staff level access
        req: asc (true/false), limit (default 10), dir (prev, next), category (created_at, status, updated_at (later))
            query: prev_cursor, next_cursor
        res: [booking detail], mata: {prev_cursor, next_cursor, can_back, can_next}
    */
    try {
        const venueId = req.params.venueId;
        const userHasAccess = await checkUserAccess(req.headers.authorization, venueId);
        if (!userHasAccess) return res.sendStatus(401); // unauthorized
        const sbAdmin = await createAdminInstance();

        // query pagination info
        const limit = parseInt(req.query.limit) || 10;
        const asc = req.query.asc === 'true';
        const category = req.query.category || 'created_at';
        // query direction info
        const dir = req.query.dir;
        let cursor = req.query.cursor;
        let cus_status;

        // for custome status
        if (req.query.cus_status) {
            cus_status = req.query.cus_status;
        }

        // next cursor
        let next_cursor = null;
        // prev cursor
        let prev_cursor = null;
        // has prev & back
        let has_prev = false;
        let has_next = false;

        // 1. Base query builder
        let query = sbAdmin
            .from('bookings')
            // Enrich data with relational queries
            .select(`
                *,
                booking_slots (
                    slot_instances (
                        start_time,
                        end_time,
                        courts (
                            id,
                            name
                        )
                    )
                ),
                payments (
                    status,
                    payment_recipe_url
                )
                
            `)
            .eq('venue_id', venueId);

        // 2. Apply status filter correctly
        if (cus_status) {
            query = query.eq('status', cus_status);
        } else {
            query = query.in('status', ['initialized', 'confirmed', 'cancelled', 'pending']);
        }

        // 3. Apply pagination logic based on cursor and direction
        if (dir === 'next' && cursor) {
            const last = decodeBase64ToObject(cursor);
            if (!last || !last.id || last[category] === undefined) return res.status(400).send("Invalid cursor format.");
            // Apply stable cursor logic
            query = query.or(`${category}.${asc ? 'gt' : 'lt'}.${last[category]},and(${category}.eq.${last[category]},id.${asc ? 'gt' : 'lt'}.${last.id})`);
        } else if (dir === 'prev' && cursor) {
            const first = decodeBase64ToObject(cursor);
            if (!first || !first.id || first[category] === undefined) return res.status(400).send("Invalid cursor format.");
            const oppositeAsc = !asc;
            // Apply stable cursor logic in the opposite direction
            query = query.or(`${category}.${oppositeAsc ? 'gt' : 'lt'}.${first[category]},and(${category}.eq.${first[category]},id.${oppositeAsc ? 'gt' : 'lt'}.${first.id})`);
            // Order by the opposite direction for querying
            query = query.order(category, { ascending: oppositeAsc }).order('id', { ascending: oppositeAsc });
        } else {
            // Initial page load, no cursor logic needed
            query = query.order(category, { ascending: asc }).order('id', { ascending: asc });
        }

        // Apply limit
        query = query.limit(limit + 1);

        // 4. Execute the final query
        let { data: bookingInfo, error: bookingInfoError } = await query;

        if (bookingInfoError) {
            console.error('admin booking error while query database: ', bookingInfoError);
            return res.sendStatus(500);
        }

        // 5. Process results and set cursors
        if (dir === 'prev' && cursor) {
            bookingInfo.reverse(); // Put the data back in the correct order
        }

        const hasExtraRecord = bookingInfo.length > limit;
        if (hasExtraRecord) {
            bookingInfo.pop(); // Remove the extra record used for checking `has_next`
        }

        if (dir === 'prev') {
            has_next = true; // If we are going back, there's always a next page (the one we came from)
            has_prev = hasExtraRecord;
        } else { // 'next' or initial load
            has_next = hasExtraRecord;
            has_prev = !!cursor; // There's a previous page if a cursor was provided
        }

        if (bookingInfo.length > 0) {
            next_cursor = has_next ? encodeObjectToBase64({ id: bookingInfo[bookingInfo.length - 1].id, [category]: bookingInfo[bookingInfo.length - 1][category] }) : null;
            prev_cursor = has_prev ? encodeObjectToBase64({ id: bookingInfo[0].id, [category]: bookingInfo[0][category] }) : null;
        }

        const meta = {
            prev_cursor,
            next_cursor,
            can_back: has_prev,
            can_next: has_next
        };

        // Flatten the subquery data for easier use on the frontend
        const processedBookingInfo = bookingInfo.map(booking => {
            if (!booking.booking_slots || booking.booking_slots.length === 0) {
                return {
                    ...booking,
                    court_name: 'N/A',
                    slots: [],
                };
            }

            const slots = booking.booking_slots.map(bs => bs.slot_instances).sort((a, b) => a.start_time.localeCompare(b.start_time));

            const courtName = slots[0]?.courts?.name || 'Unknown Court';

            // Create an array of individual slots instead of a single time range
            const processedSlots = slots.map(slot => ({
                start_time: slot.start_time,
                end_time: slot.end_time
            }));

            // Extract payment info
            const paymentStatus = booking.payments?.status || 'N/A';
            const paymentReceiptUrl = booking.payments?.payment_recipe_url || null;

            // Create a new object without the original booking_slots
            const { booking_slots, payments, ...rest } = booking;

            return { ...rest, court_name: courtName, slots: processedSlots, payment_status: paymentStatus, payment_receipt_url: paymentReceiptUrl };
        });
        return res.status(200).json({
            bookingInfo: processedBookingInfo,
            meta
        });

    } catch (err) {
        console.error('error from admin-booking: ', err);
        return res.sendStatus(500);
    }

})
// route.get('/get_booking_by_last_index', async (req, res) => {
//     // get booking by last index
//     // TODO:

// })

// route.get('/get_booking_by_search', async (req, res) => {
//     // get booking by search

// })

// route.get('/get_booking_detail_by_id', async (req, res) => {
//     // get booking detail by id
//     // TODO:
// })

route.patch('/update_booking_status/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { newStatus } = req.body;

        if (!newStatus || !['pending', 'confirmed', 'cancelled'].includes(newStatus)) {
            return res.status(400).json({ message: 'Status baru yang diberikan tidak valid.' });
        }

        const sbAdmin = await createAdminInstance();

        // Ambil venue_id dari booking untuk verifikasi akses
        const { data: bookingData, error: fetchError } = await sbAdmin
            .from('bookings')
            .select('venue_id')
            .eq('id', bookingId)
            .single();

        if (fetchError || !bookingData) return res.status(404).json({ message: "Booking tidak ditemukan." });

        // Verifikasi bahwa pengguna memiliki akses ke venue ini
        const userHasAccess = await checkUserAccess(req.headers.authorization, bookingData.venue_id);
        if (!userHasAccess) return res.sendStatus(401); // Unauthorized

        const { data: updatedBooking, error: updateError } = await sbAdmin
            .from('bookings')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', bookingId)
            .select();

        if (updateError) throw updateError;

        return res.status(200).json(updatedBooking);
    } catch (err) {
        console.error('Error updating booking status: ', err);
        return res.status(500).json({ message: "Terjadi kesalahan internal." });
    }
});

export default route;
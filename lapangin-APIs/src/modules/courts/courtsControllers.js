import express from 'express';

// middleware
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';
import checkUserAccess from '../../middlewares/auth/checkUserAccess.js';

// libs
import createSupabaseAccess from '../../libs/supabase/admin.js';

const route = express.Router();

// court table connect with
/**
 * 1. slot templates (store duration 30 or 60)
 * 2. slot_instances (generate by workers)
 * 3. slot_tempalates
 * 2. general price rules (store court price for weekend and weekdays)
 */

// TODO: configure request 
route.post('/create_new_court', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const venue_id = req.body.venue_id;

        const sbAdmin = await createSupabaseAccess();

        // 1. check if user had access for this action, 
        const hasAccess = await checkAdminAccess(req.headers.authorization, venue_id); // requst stopped here, somehow
        if (!hasAccess) return res.status(401).json({ message: 'access denied' });

        // 2. create new court for that venue_id
        const { data: newInsertedCourt, error: insertCourtError } = await sbAdmin
            .from('courts')
            .insert([
                {
                    venue_id: req.body.venue_id,
                    name: req.body.name,
                    is_active: true, // this is default value
                    capacity: req.body.capacity,
                    slot_duration_minutes: req.body.slot_duration_minutes,
                    weekday_slot_price: req.body.weekday_slot_price,
                    weekend_slot_price: req.body.weekend_slot_price
                }
            ]).select();

        if (insertCourtError) {
            console.error('Error inserting court:', insertCourtError);
            return res.status(400).json({ message: 'Failed to create court', error: insertCourtError.message });
        }

        // 3. create slot_template for that new court
        const { data: newSlotTemplate, error: insertSlotTemplateError } = await sbAdmin
            .from('slot_templates')
            .insert([{
                court_id: newInsertedCourt[0].id,
                slot_duration_minutes: req.body.slot_duration_minutes,
                updated_at: new Date()
            }]).select()

        if (insertSlotTemplateError) {
            console.error('Error inserting slot template:', insertSlotTemplateError);
            return res.status(400).json({ message: 'Failed to create slot template', error: insertSlotTemplateError.message });
        }
        console.log(newSlotTemplate);

        // 4. insert general_price_rules // FIXME: error occured hre
        const { data: newGeneralPriceRules, error: insertGeneralPriceRulesError } = await sbAdmin
            .from('general_price_rules')
            .insert([{
                court_id: newInsertedCourt[0].id,
                weekday_price: req.body.weekday_slot_price,
                weekend_price: req.body.weekend_slot_price,
            }]).select()

        if (insertGeneralPriceRulesError) {
            console.error('Error inserting general price rules:', insertGeneralPriceRulesError);
            return res.status(400).json({ message: 'Failed to create general price rules', error: insertGeneralPriceRulesError.message });
        }

        // 5. availability_rules
        // Membuat data untuk 7 hari (0=Senin, ..., 6=Minggu) secara terprogram
        const availabilityRulesData = Array.from({ length: 7 }, (_, i) => ({
            court_id: newInsertedCourt[0].id,
            day_of_week: i,
            open_time: req.body.open_time,
            close_time: req.body.close_time,
        }));
        const { data: newAvailabilityRules, error: insertAvailabilityRulesError } = await sbAdmin
            .from('availability_rules')
            .insert(availabilityRulesData)
            .select();

        if (insertAvailabilityRulesError) {
            console.error('Error inserting availability rules:', insertAvailabilityRulesError);
            return res.status(400).json({ message: 'Failed to create availability rules', error: insertAvailabilityRulesError.message });
        }
        console.log(newAvailabilityRules);
        return res.status(201).json({ message: 'new court created' });
    } catch (err) {
        console.log('error from checkAdminAccess: ', err);
        return res.status(500).json({ message: 'something went wrong' });
    }
})
route.get('/get_all_courts/:venueId', async (req, res) => {
    // TODO: config all court fetching for that venue
    /**
     * Return:
     * name
     * type (this is null, not yet configured)
     * weekday_slot_price
     * weekend_slot_price
     * slot_duration_minutes (30 or 60) minutes
     * is_active
     * capacity
     * 
     */
    try {
        // check user access for this venue
        const venue_id = req.params.venueId;
        const userHasAccess = await checkUserAccess(req.headers.authorization, venue_id);
        if (!userHasAccess) return res.status(401).json({ message: 'access denied, either you dont have access or token is invalid' });

        // fetch all court metadata for that venue
        const sbAdmin = await createSupabaseAccess(); // create service role access
        const { data: allCourts, error: getAllCourtsError } = await sbAdmin
            .from('courts')
            .select('id, name, type, weekday_slot_price, weekend_slot_price, slot_duration_minutes, is_active, capacity', { count: 'exact' })
            .eq('venue_id', venue_id);
            if (getAllCourtsError) {
                console.log('error from courtsControllers: ', getAllCourtsError);
                return res.status(400).json({ message: 'something went wrong' });
            }

        // fetch all availability rules
        const { data: allAvailabilityRules, error: getAllAvailabilityRulesError } = await sbAdmin
            .from('availability_rules')
            .select('court_id, day_of_week, open_time, close_time', { count: 'exact' })
            .in('court_id', allCourts.map(court => court.id));

            if (getAllAvailabilityRulesError) {
                console.log('error from availability_rules: ', getAllAvailabilityRulesError);
                return res.status(400).json({ message: 'something went wrong' });
            }

            const availabilityRulesByCourtId = allAvailabilityRules.reduce((container, rule) => {
                if (!container[rule.court_id]) container[rule.court_id] = [];
                rule.day_name = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][rule.day_of_week]; // berikan nama hari berdasarkan index
                container[rule.court_id].push(rule); // tambahkan hari untuk court dengan id yang sama
                return container;
            }, {})
            // sort availability rues by court id 
            Object.keys(availabilityRulesByCourtId).forEach( courtId => {
                availabilityRulesByCourtId[courtId].sort((a, b) => {
                    return a.day_of_week - b.day_of_week;
                })
            })

        // reduce data to key value format, where id of the court will be the key
        // sambungkan availability rules ke dalam sini
        const readyData = allCourts.reduce((container, court) => {
            if (!court) return container;
            const courtId = court.id;

            // Gabungkan data court dengan availability rules-nya
            container[court.id] = { ...court, availability_rules: availabilityRulesByCourtId[court.id] || [] };

            return container;
        }, {}) // dont forget to start with an empty container

        if (getAllCourtsError) return res.status(400).json({ message: `fetch from database error, ${getAllCourtsError.message}` });
        return res.status(200).json({ message: 'success', data: readyData });
    } catch (err) {
        console.log('error from courtsControllers: ', err);
        res.status(500).json({ message: 'something went wrong, interanal server error' });
    }
})

route.post('/update_court_by_id/:courtId', async (req, res) => {
    try {
        // check user access 
        const userHasAccess = await checkAdminAccess(req.headers.authorization, req.body.venue_id);
        if (!userHasAccess) return res.status(401).json({message: 'access denied, token expired or user didnt have access'})

        const sbAdmin = await createSupabaseAccess();
        const courtId = req.params.courtId;

        // update court metadata
        const {data: updatedCourt, error: updateCourtError} = await sbAdmin
            .from('courts')
            .update({
                name: req.body.name,
                capacity: req.body.capacity,
                slot_duration_minutes: req.body.slot_duration_minutes,
                weekday_slot_price: req.body.weekday_slot_price,
                weekend_slot_price: req.body.weekend_slot_price,
                is_active: req.body.is_active
            }).eq('id', courtId)

            if(updateCourtError) return res.status(400).json({message: 'something went wrong'});
            // update availability rules
        const newAvailabilityRules = req.body.availability_rules;

        const {data: setSlotTemplates, error: setSlotTemplateError} = await sbAdmin
            .from('slot_templates')
            .update([
                {
                    slot_duration_minutes: req.body.slot_duration_minutes
                }
            ]).eq('court_id', courtId);
            if(setSlotTemplateError) return res.status(400).json({message: 'something went wrong'});

        await newAvailabilityRules.forEach( async (rule) => {
            try{
                await sbAdmin
                    .from('availability_rules')
                    .update([
                        {
                            day_of_week: rule.day_of_week,
                            open_time: rule.open_time,
                            close_time: rule.close_time
                        }
                    ])
                    .eq('court_id', courtId).eq('day_of_week', rule.day_of_week);
            }catch(err){
                console.error('error from availability_rules: ', err); 
                return res.status(400).json({message: 'update availability rules failed'});
            }
        });

        // save new general price rules
        const {data: updatedGeneralPriceRules, error: updateGeneralPriceRulesError} = await sbAdmin
            .from('general_price_rules')
            .update([
                {
                    weekday_price: req.body.weekday_slot_price,
                    weekend_price: req.body.weekend_slot_price
                }
            ]).eq('court_id', courtId)
        if(updateGeneralPriceRulesError) return res.status(400).json({message: 'something went wrong'});

            
        return res.status(200).json({message: 'court updated'});

        // get court id, update all table that got effected by that changes
    } catch (err) {
        console.log('error from checkAdminAccess: ', err);
        res.status(500).json({ message: 'something went wrong, internal server error' });
    }

})

route.delete('/delete_court_by_id/:venueId/:courtId', async (req, res) => {
    try{
        // chec user access 
        const userHasAccess = await checkUserAccess(req.headers.authorization);
        if(!userHasAccess) res.status(401).json({message: 'access denied, token expired or user didnt have access'});

        // extract data
        const sbAdmin = await createSupabaseAccess();
        const courtId = req.params.courtId;
        const venueId = req.params.venueId;

        // delte court
        const {data: deletedCourt, error: deleteCourtError} = await sbAdmin
            .from('courts')
            .delete()
            .eq('id', courtId)
            .eq('venue_id', venueId);

        if(deleteCourtError) {
            console.log('error from courtControllers: ', deleteCourtError);
            return res.status(400).json({message: 'something went wrong'});
        }
        // delete slot_templates

        return res.status(200).json({message: 'court deleted'}); // send success status
    }catch(err){
        console.error('error from courtController:', err);
        return res.status(500).json({message: 'something went wrong, internal server error'});
    }
})

export default route;
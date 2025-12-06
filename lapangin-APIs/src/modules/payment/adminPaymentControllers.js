import express from 'express';
import multer from 'multer';

// libs
import createAdminAccess from '../../libs/supabase/admin.js'
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';

// utils
import createSlug from '../../utils/createSlug.js';
import generateSecureRandomString from '../../utils/authTools/generateRandomToken.js';
import { access } from 'fs';

const route = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Konfigurasi multer untuk menyimpan file di memori


route.post('/create_new_payment', upload.single('file'), async (req, res) => {
    // admin level access
    const venueId = req.body.venueId;
    /**Body: 
     * provider_id, name, type = enum,  currency, venue_id, is_active = true, sattlement rules = null, 
     */
    // console.log('request, ',req.body, req.file);
    const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
    if (!userHasAccess) return res.sendStatus(401);
    
    const sbAdmin = await createAdminAccess();

    const provider = req.body.provider;
    const name = req.body.name;
    const type = req.body.type;
    const currency = req.body.currency;
    const isActive = true;
    const account = req.body.account;
    // if type is qris, set imageMetadata & imagePath
    let imageMetadata = null;
    let imagePath = null;
    let imageUrl = null;

    // image (if type is qris only)
    if(type === 'Qris'){
        // req.file akan berisi informasi file yang diunggah oleh multer
        const imageFile = req.file;
        if (!imageFile) {
            return res.status(400).send('File Qris dibutuhkan untuk tipe pembayaran ini.');
        }
        const magic = imageFile.buffer.toString('hex', 0, 8).slice(0, 8);
        // console.log('magic file', magic);
        const allowedMagic = ['89504e47', 'ffd8ffe0', '52494646']; // png, jpg, riff (webp starts with RIFF)
        if (!allowedMagic.includes(magic)) {
            return res.status(400).json({ error: 'Invalid image file' });
        }
        const ext = (imageFile.originalname.split('.').pop() || 'bin').replace(/\W/g,'');
        const filename = `${Date.now()}-${Math.floor(Math.random()*1e6)}.${ext}`;
        const path = `payment/${venueId}/${filename}`; // akan digunakan untuk query nanti


        // check size before uploading
        if (imageFile.size > 10 * 1024 * 1024) {
            console.error('error from admin payment, file to large');
            return res.sendStatus(400)
        }
        // Upload imageFile.buffer ke Supabase Storage
        const {data: uploadImage, error: uploadError} = await sbAdmin
            .storage.from('payment_bucket')
            .upload(path, imageFile.buffer, {
                contentType: imageFile.mimetype,
                upsert: true
            });
            if(uploadError){
                console.error('error from adminPayment, upload error: ',uploadError );
                return res.status(500).json({ error: uploadError.message });
            }
            
        // create a url for that image
        const {data:signed, error: signedError} = await sbAdmin
            .storage.from('payment_bucket')
            .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
            if(signedError){
                console.error('error from adminPayment, signed error: ',signedError );
                return res.status(500).json({ error: signedError.message });
            }
            
            
            // insert image metadata & url
        imageUrl = signed.signedUrl;
        imageMetadata = {
            path: path,
            filename: filename, 
            size: imageFile.size,
            mime: imageFile.mimetype
        }
        imagePath = path;
    }
    const {error: insertError} = await sbAdmin
        .from('venue_payments')
        .insert([
            {
                provider_id: provider,
                name: name,
                type: type,
                currency: currency,
                is_active: isActive,
                venue_id: venueId,
                image_metadata: imageMetadata,
                image_url: imageUrl,
                account_number: account
            }
        ])
    
    if (insertError){
        console.log('error from adminPaymnt, ', insertError);
        return res.status(500).json({ error: insertError.message });}

    return res.status(201).send('Metode pembayaran berhasil dibuat.');

})


route.delete('/delete_payment/:venueId/:id', async (req, res) => {
    // admin level access
    const venueId = req.params.venueId;
    const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
    if (!userHasAccess) return res.sendStatus(401);

    const sbAdmin = await createAdminAccess();

    // add checking
    const id = req.params.id;
    const {error: deleteError} = await sbAdmin
        .from('venue_payments')
        .delete()
        .eq('id', id)
        .eq('venue_id', venueId);
        if(deleteError){
            console.log('error from adminPayment: ', deleteError);
            return res.sendStatus(500);
        }
    return res.sendStatus(200);

})

route.put('/update_payment', upload.single('file'), async (req, res) => {
    // admin level access
    const venueId = req.body.venueId;
    /**Body: 
     * provider_id, name, type = enum,  currency, venue_id, is_active = true, sattlement rules = null, 
     */
    // console.log('request, ',req.body, req.file);
    const userHasAccess = await checkAdminAccess(req.headers.authorization, venueId);
    if (!userHasAccess) return res.sendStatus(401);
    
    const sbAdmin = await createAdminAccess();

    const id = req.body?.id;
    const provider = req.body?.provider;
    const name = req.body?.name;
    const type = req.body?.type;
    const currency = req.body?.currency;
    const isActive = req.body?.isActive;
    const account = req.body?.account;
    // if type is qris, set imageMetadata & imagePath
    let imageMetadata = null;
    let imagePath = null;
    let imageUrl = null;

    // image (if type is qris only)
    if(type === 'Qris' && req.file){
        // req.file akan berisi informasi file yang diunggah oleh multer
        const imageFile = req.file;
        const magic = imageFile.buffer.toString('hex', 0, 8).slice(0, 8);
        // console.log('magic file', magic);
        const allowedMagic = ['89504e47', 'ffd8ffe0', '52494646']; // png, jpg, riff (webp starts with RIFF)
        if (!allowedMagic.includes(magic)) {
            return res.status(400).json({ error: 'Invalid image file' });
        }
        const ext = (imageFile.originalname.split('.').pop() || 'bin').replace(/\W/g,'');
        const filename = `${Date.now()}-${Math.floor(Math.random()*1e6)}.${ext}`;
        const path = `qris/${venueId}/${filename}`; // akan digunakan untuk query nanti


        // check size before uploading
        if (imageFile.size > 10 * 1024 * 1024) {
            console.error('error from admin payment, file to large');
            return res.sendStatus(400)
        }
        // Upload imageFile.buffer ke Supabase Storage
        const {data: uploadImage, error: uploadError} = await sbAdmin
            .storage.from('payment_bucket')
            .upload(path, imageFile.buffer, {
                contentType: imageFile.mimetype,
                upsert: true
            });
            if(uploadError){
                console.error('error from adminPayment, upload error: ',uploadError );
                return res.status(500).json({ error: uploadError.message });
            }
            
        // create a url for that image
        const {data:signed, error: signedError} = await sbAdmin
            .storage.from('payment_bucket')
            .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
            if(signedError){
                console.error('error from adminPayment, signed error: ',signedError );
                return res.status(500).json({ error: signedError.message });
            }
            
            
            // insert image metadata & url
        imageUrl = signed.signedUrl;
        imageMetadata = {
            path: path,
            filename: filename, 
            size: imageFile.size,
            mime: imageFile.mimetype
        }
        imagePath = path;
        const {error: insertError} = await sbAdmin
            .from('venue_payments')
            .update(
                {
                    provider_id: provider,
                    name: name,
                    type: type,
                    currency: currency,
                    is_active: isActive,
                    venue_id: venueId,
                    image_metadata: imageMetadata,
                    image_url: imageUrl
                }
            ).eq('id', id).eq('venue_id', venueId);
    
        if (insertError){
            console.log('error from adminPaymnt, ', insertError);
            return res.status(500).json({ error: insertError.message });}

        return res.status(200).send('Metode pembayaran berhasil diupdate dengan gambar baru.');

    }
    // for type non qris
    const {error: insertError} = await sbAdmin
        .from('venue_payments')
        .update(
            {
                provider_id: provider,
                name: name,
                type: type,
                currency: currency,
                is_active: isActive,
                venue_id: venueId,
                account_number: account
            }
        ).eq('id', id).eq('venue_id', venueId);
    
    if (insertError){
        console.log('error from adminPaymnt, ', insertError);
        return res.status(500).json({ error: insertError.message });}

    return res.status(201).send('Metode pembayaran berhasil diupdate.');
})

route.get('/get_payment/:venueId', async (req, res) => {
    // admin level access
    const venueId = req.params.venueId;
    const userHasAccess = checkAdminAccess(req.headers.authorization, venueId);
    if(!userHasAccess) return res.sendStatus(401);

    const sbAdmin = await createAdminAccess();

    // query all payment for this courtSpace(venue)
    const {data: payments, error} = await sbAdmin
        .from('venue_payments')
        .select('id, name, provider_id, type, currency, image_url, is_active, account_number')
        .eq('venue_id', venueId)
        if(error){
            console.log('error from adminPayment, ', error);
            return res.status(500).json({ error: error.message });
        }
    return res.status(200).json(payments);
})

export default route;
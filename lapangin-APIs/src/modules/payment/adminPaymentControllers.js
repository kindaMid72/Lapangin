import express from 'express';
import multer from 'multer';

// libs
import createAdminAccess from '../../libs/supabase/admin.js'
import checkAdminAccess from '../../middlewares/auth/checkAdminAccess.js';

// utils
import createSlug from '../../utils/createSlug.js';
import generateSecureRandomString from '../../utils/authTools/generateRandomToken.js';

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
    // if type is qris, set imageMetadata & imagePath
    let imageMetadata = null;
    let imagePath = null;

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
            
        // insert image metadata & path
        imageMetadata = {
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
                image_path: imagePath
            }
        ])
    
    if (insertError){
        console.log('error from adminPaymnt, ', insertError);
        return res.status(500).json({ error: insertError.message });}

    return res.status(201).send('Metode pembayaran berhasil dibuat.');

})


route.delete('/delete_payment', async (req, res) => {
    // admin level access
})

route.put('/update_payment', async (req, res) => {
    // admin level access
})

route.get('/get_payment', async (req, res) => {
    // admin level access
})

export default route;
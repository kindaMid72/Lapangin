
import { createClient } from '@supabase/supabase-js';

export default async function createAdminInstance() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
    }

    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Error creating Supabase admin instance:", error.message);
    throw error; // Lemparkan kembali error agar bisa ditangkap oleh pemanggil
  }
}

// this code came from supabase docs
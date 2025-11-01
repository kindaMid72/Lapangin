
import { createClient } from '@supabase/supabase-js'

export default async function createClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// this code came from supabase docs
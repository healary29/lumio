import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tuvfjfvqhggpiysuknfp.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable__SKr9vJdqQMardR2hD-eTg_eZgDnJE_'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

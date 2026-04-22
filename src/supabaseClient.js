import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wersbtloqzbpxuxxhafe.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mqV0JakwJ_RyedRZtvb1Tg_Ne7Q8-zu'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

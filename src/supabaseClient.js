// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Ambil variabel environment
const supabaseUrl = process.env.VUE_APP_SUPABASE_URL
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_ANON_KEY

// Buat satu klien Supabase untuk diekspor
export const supabase = createClient(supabaseUrl, supabaseAnonKey)


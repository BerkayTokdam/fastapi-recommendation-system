import { createClient } from '@supabase/supabase-js'
import { MMKVStorage } from '../lib/mmkv' // Az önce oluşturduğumuz MMKVStorage

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Supabase URL or Anon Key is missing. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: MMKVStorage, // MMKV'yi burada entegre ediyoruz
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
})

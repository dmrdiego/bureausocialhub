import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

import { mockSupabase } from './mockSupabase'

// Check if environment variables are set and appear valid
const isValidUrl = (url: string) => {
    try {
        return url.startsWith('http') && !url.includes('YOUR_SUPABASE_URL')
    } catch {
        return false
    }
}

const useMock = !supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl);

if (useMock) {
    console.warn('⚠️ SUPABASE KEYS MISSING OR DEFAULT. RUNNING IN DEMONSTRATION MODE (MOCK DATA).');
    console.warn('Edit .env.local with real keys to connect to actual backend.');
}

// Export either real client or mock client
export const supabase = useMock
    ? (mockSupabase as any)
    : createClient(supabaseUrl, supabaseAnonKey)

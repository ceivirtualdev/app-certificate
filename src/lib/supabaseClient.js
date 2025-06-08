import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wpbpnxkpgfkwincjsdpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYnBueGtwZ2Zrd2luY2pzZHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM2NjgsImV4cCI6MjA2NDk4OTY2OH0.hJyy145QRFuklDluYx_4jQ9-ciDbtDxuBx6OGpTDeQ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
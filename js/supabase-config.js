// Supabase Configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://clwbolznpbmlmvodzprt.supabase.co';
const supabaseAnonKey = 'sb_publishable_9-FN0AxH65tsUY9GKlGYBg_U2-ZnsVG';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
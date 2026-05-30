// js/supabase.js
// Creates the global Supabase client used everywhere in the app.
// Loaded after config.js so SUPABASE_URL and SUPABASE_ANON_KEY are defined.

const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

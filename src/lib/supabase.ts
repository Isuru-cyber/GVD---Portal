import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iyyntdtxpcpjzdzmwbnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5eW50ZHR4cGNwanpkem13Ym5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzcyNzcsImV4cCI6MjA5MTIxMzI3N30.0NXFLGSzjoMy78UuoF0VyPc0M_yB3wu116UAffX13C8';

// Provide a dummy client if keys are missing to prevent app crash at startup
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      from: () => ({ 
        select: () => ({ order: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }) }) }) }),
        insert: () => Promise.resolve({ error: { message: 'Supabase keys missing' } }),
        update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase keys missing' } }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase keys missing' } }) }),
      }),
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {}
    } as any;

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env に設定してください');
}

// Service Role Key を使用してサーバーサイドから Supabase に接続する
export const supabase = createClient(supabaseUrl, supabaseKey);

// import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Individual checks for better debugging
const missing: string[] = [];
if (!supabaseUrl) missing.push("SUPABASE_URL");
if (!supabaseAnonKey) missing.push("SUPABASE_ANON_KEY");
if (missing.length > 0) {
  throw new Error(`Missing Supabase env vars: ${missing.join(", ")}`);
}

// Validate URL format — strip trailing /rest/v1 if accidentally included
const cleanUrl = supabaseUrl!.replace(/\/rest\/v1\/?$/, "");

export const supabase = createClient(cleanUrl, supabaseAnonKey!);

export function SuperBaseAdmin() {
  return createClient(cleanUrl, supabaseServiceKey || supabaseAnonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}


export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "book-uploads";
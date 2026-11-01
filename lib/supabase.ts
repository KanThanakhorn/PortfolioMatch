import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const databaseMode = Boolean(url && publishableKey);

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowser(): SupabaseClient<Database> | null {
  if (!url || !publishableKey) return null;
  if (!browserClient) browserClient = createClient<Database>(url, publishableKey);
  return browserClient;
}

import { createClient } from "@supabase/supabase-js";
import { getAuth } from '@clerk/nextjs/server';

function createClerkSupabaseClient() {


    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await window.Clerk.session?.getToken({
              template: "supabase",
            });
  
  
            const headers = new Headers(options?.headers);
            headers.set("Authorization", `Bearer ${clerkToken}`);
  
            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      }
    );

}


function createSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!)
}


export { createClerkSupabaseClient  , createSupabaseClient};
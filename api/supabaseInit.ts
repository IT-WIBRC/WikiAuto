import {createClient} from "@supabase/supabase-js";
import { Database } from "~/api/wikiAutoType";

let supabaseInstance: ReturnType<createClient>;
export default function (): string {
    if (!supabaseInstance) {
        const config = useRuntimeConfig();
        supabaseInstance = createClient<Database>(
            config.public.supabaseUrl,
            config.public.supabaseKey
        );
    }
    return supabaseInstance;
}
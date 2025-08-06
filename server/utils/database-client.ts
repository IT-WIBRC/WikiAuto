import type { H3Event } from "h3";
import { getHeader, setHeader } from "h3";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "~/shared/types/database.types";

export function useRequestClient(event: H3Event) {
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.supabaseUrl;
  const supabaseKey = config.public.supabaseKey;

  if (!supabaseUrl) {
    throw new Error(
      "Supabase URL is missing in runtime config. Please check your .env file.",
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "Supabase Key is missing in runtime config. Please check your .env file.",
    );
  }

  const parseCookies = (
    cookieString: string | undefined,
  ): Record<string, string> => {
    if (!cookieString) return {};
    return Object.fromEntries(
      cookieString
        .split(";")
        .map((cookie) => cookie.trim().split("="))
        .filter((cookie) => cookie.length === 2)
        .map(([name, value]) => [name, decodeURIComponent(value)]),
    );
  };

  return createServerClient<Database>(
    supabaseUrl as string,
    supabaseKey as string,
    {
      cookies: {
        getAll: () => {
          const cookieString = getHeader(event, "cookie");
          const parsedCookies = parseCookies(cookieString);
          return Object.entries(parsedCookies).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll: (cookiesToSet) => {
          const serializedCookies = cookiesToSet.map((c) => {
            const parts = [`${c.name}=${encodeURIComponent(c.value)}`];
            const options = c.options;

            if (options.domain) parts.push(`Domain=${options.domain}`);
            if (options.expires) parts.push(`Expires=${options.expires}`);
            if (options.httpOnly) parts.push("HttpOnly");
            if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
            if (options.path) parts.push(`Path=${options.path}`);
            if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
            if (options.secure) parts.push("Secure");

            return parts.join("; ");
          });
          setHeader(event, "Set-Cookie", serializedCookies);
        },
      },
    },
  );
}

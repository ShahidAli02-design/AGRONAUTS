// Lovable auth integration adapter
import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: string, opts?: any) => {
      try {
        const { data, error } = await (supabase.auth as any).signInWithOAuth?.({
          provider,
          options: opts,
        }) ?? { data: null, error: null };
        return { data, error, redirected: false };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)), redirected: false };
      }
    },
  },
};

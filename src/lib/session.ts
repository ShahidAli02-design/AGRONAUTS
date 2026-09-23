import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "farmer" | "buyer" | "processor" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  village: string | null;
  district: string | null;
  language: string;
  role?: AppRole;
  email?: string;
};

export type { RegisteredUser } from "@/integrations/supabase/seed";
export { DEFAULT_USERS } from "@/integrations/supabase/seed";
import type { RegisteredUser } from "@/integrations/supabase/seed";
import { DEFAULT_USERS } from "@/integrations/supabase/seed";

const AUTH_SESSION_KEY = "agronauts.auth_session";

// Accounts live in the shared server database so the admin dashboard sees
// every sign-up and a user can log in from any device.
async function authRequest(path: string, body: unknown): Promise<RegisteredUser> {
  let res: Response;
  try {
    res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the server. Check your internet connection.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.error || "Something went wrong. Please try again.");
  return json.user as RegisteredUser;
}

export function registerUser(user: Omit<RegisteredUser, "id" | "created_at">): Promise<RegisteredUser> {
  return authRequest("register", user);
}

export function loginUser(email: string, password: string): Promise<RegisteredUser> {
  return authRequest("login", { email, password });
}

export function getStoredSession(): { user: User; profile: Profile; role: AppRole } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(session: { user: User; profile: Profile; role: AppRole } | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  } else {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }
  window.dispatchEvent(new Event("agronauts-auth-change"));
}

export function useSession() {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [role, setRole] = React.useState<AppRole | null>(null);
  const [loading, setLoading] = React.useState(true);

  const reloadSession = React.useCallback(() => {
    // 1. Check local authenticated session
    const local = getStoredSession();
    if (local) {
      setUser(local.user);
      setProfile(local.profile);
      setRole(local.role);
      setLoading(false);
      return;
    }

    // 2. Otherwise check Supabase
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (data.user) {
        setUser(data.user);
        const [{ data: p }, { data: r }] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, phone, village, district, language")
            .eq("id", data.user.id)
            .maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", data.user.id).limit(1),
        ]);
        if (!active) return;
        const currentProfile = (p as Profile | null) ?? {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name ?? "User",
          phone: data.user.user_metadata?.phone ?? null,
          village: data.user.user_metadata?.village ?? null,
          district: data.user.user_metadata?.district ?? "Nashik",
          language: "en",
        };
        const currentRole = ((r?.[0]?.role as AppRole | undefined) ??
          data.user.user_metadata?.role ??
          "farmer") as AppRole;
        setProfile(currentProfile);
        setRole(currentRole);
        setStoredSession({ user: data.user, profile: currentProfile, role: currentRole });
      } else {
        // No authenticated session
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    reloadSession();
    const handleAuthChange = () => {
      reloadSession();
    };
    window.addEventListener("agronauts-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("agronauts-auth-change", handleAuthChange);
    };
  }, [reloadSession]);

  const signOut = React.useCallback(async () => {
    setStoredSession(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(null);
    setRole(null);
    window.dispatchEvent(new Event("agronauts-auth-change"));
  }, []);

  const switchRole = React.useCallback(
    (newRole: AppRole) => {
      const match = DEFAULT_USERS.find((u) => u.role === newRole)!;
      const dummyUser = {
        id: match.id,
        email: match.email,
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: { full_name: match.full_name, role: match.role },
        created_at: match.created_at,
      } as unknown as User;

      const dummyProfile: Profile = {
        id: match.id,
        full_name: match.full_name,
        phone: match.phone,
        village: match.village,
        district: match.district,
        language: match.language,
        role: match.role,
        email: match.email,
      };

      setUser(dummyUser);
      setProfile(dummyProfile);
      setRole(newRole);
      setStoredSession({ user: dummyUser, profile: dummyProfile, role: newRole });
    },
    []
  );

  return { user, profile, role, loading, signOut, switchRole, reloadSession };
}

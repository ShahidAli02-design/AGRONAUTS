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

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string; // Plain/hashed for demo store
  full_name: string;
  phone: string;
  village: string;
  district: string;
  role: AppRole;
  language: string;
  created_at: string;
  landVerified?: boolean;
}

// Pre-seeded verified accounts for each of the 4 roles
export const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: "usr-farmer-1",
    email: "farmer@agronauts.in",
    passwordHash: "farmer123",
    full_name: "रामदास जाधव (Ramdas Jadhav)",
    phone: "9822012345",
    village: "पिंपळगाव बसवंत (Pimpalgaon)",
    district: "Nashik",
    role: "farmer",
    language: "mr",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "usr-buyer-1",
    email: "buyer@agronauts.in",
    passwordHash: "buyer123",
    full_name: "सुरेश पटेल (Suresh Patel - Reliance Fresh)",
    phone: "9820098765",
    village: "वाशी एपीएमसी (Vashi APMC)",
    district: "Mumbai",
    role: "buyer",
    language: "en",
    created_at: "2026-01-15T12:00:00Z",
  },
  {
    id: "usr-processor-1",
    email: "processor@agronauts.in",
    passwordHash: "processor123",
    full_name: "सह्याद्री अ‍ॅग्रो फूड्स (Sahyadri Agro Processing)",
    phone: "9850112233",
    village: "मोहोळ (Mohol)",
    district: "Pune",
    role: "processor",
    language: "mr",
    created_at: "2026-02-01T08:30:00Z",
  },
  {
    id: "usr-admin-1",
    email: "admin@agronauts.in",
    passwordHash: "admin123",
    full_name: "डॉ. विजय गायकवाड (Dr. Vijay Gaikwad - APMC Director)",
    phone: "9823055443",
    village: "शिवाजीनगर",
    district: "Pune",
    role: "admin",
    language: "mr",
    created_at: "2026-01-01T09:00:00Z",
  },
];

const REGISTERED_USERS_KEY = "agronauts.registered_users";
const AUTH_SESSION_KEY = "agronauts.auth_session";

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = window.localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw) as RegisteredUser[];
    // Ensure all default users exist
    const existingEmails = new Set(parsed.map((u) => u.email.toLowerCase()));
    let updated = false;
    for (const def of DEFAULT_USERS) {
      if (!existingEmails.has(def.email.toLowerCase())) {
        parsed.push(def);
        updated = true;
      }
    }
    if (updated) {
      window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveRegisteredUser(user: RegisteredUser) {
  if (typeof window === "undefined") return;
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
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
      const match = getRegisteredUsers().find((u) => u.role === newRole) || DEFAULT_USERS.find((u) => u.role === newRole)!;
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

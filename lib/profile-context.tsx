"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Profile = "singpass" | "mom";

export interface ProfileConfig {
  id: Profile;
  label: string;
  role: string;
  initials: string;
  avatarColor: string;
  ownerFilter: string | null; // null = see all
  agencyName: string;
}

export const PROFILES: Record<Profile, ProfileConfig> = {
  singpass: {
    id: "singpass",
    label: "Singpass PX Ops",
    role: "PX Ops",
    initials: "PX",
    avatarColor: "bg-blue-600",
    ownerFilter: null,
    agencyName: "Singpass",
  },
  mom: {
    id: "mom",
    label: "MOM Agency",
    role: "Agency RP",
    initials: "MO",
    avatarColor: "bg-orange-500",
    ownerFilter: "MOM RP Team",
    agencyName: "Ministry of Manpower",
  },
};

interface ProfileContextType {
  profile: Profile;
  config: ProfileConfig;
  setProfile: (p: Profile) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>("singpass");
  return (
    <ProfileContext.Provider value={{ profile, config: PROFILES[profile], setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

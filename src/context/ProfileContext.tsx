import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type UserProfile = {
  name: string;
  email: string;
  goals: string[];
  interests: string[];
  createdAt: string;
};

type ProfileContextValue = {
  profile: UserProfile | null;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileContext.');
  return context;
}

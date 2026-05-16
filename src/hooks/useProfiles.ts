// src/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import {
  getProfileByUserId,
  updateProfileName,
  updateProfilePhone,
  createProfile,
  Profile,
} from '../lib/profiles';
import { supabase } from '../lib/supabase';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const data = await getProfileByUserId(user.id);
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateName = async (fullName: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const updated = await updateProfileName(user.id, fullName);
      setProfile(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async (phone: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const updated = await updateProfilePhone(user.id, phone);
      setProfile(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (profileData: Profile) => {
    try {
      setLoading(true);
      const created = await createProfile(profileData);
      setProfile(created);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateName: handleUpdateName,
    updatePhone: handleUpdatePhone,
    createProfile: handleCreateProfile,
  };
};
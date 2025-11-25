'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TenantProfile } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';

export const useTenantProfile = () => {
    const { user } = useAuth();
    const supabase = createClient();
    const [profile, setProfile] = useState<TenantProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('preferences')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data?.preferences) {
                setProfile(data.preferences as TenantProfile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (newProfile: TenantProfile) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ preferences: newProfile })
                .eq('id', user?.id);

            if (error) throw error;

            setProfile(newProfile);
            toast.success('Profile updated successfully!');
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
            return false;
        }
    };

    return { profile, loading, updateProfile };
};

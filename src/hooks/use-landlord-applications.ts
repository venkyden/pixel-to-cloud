'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

export interface Applicant {
    id: string;
    name: string;
    profession: string;
    income: number;
    match: number;
    status: 'pending' | 'approved' | 'rejected';
    property: string;
    property_id: number;
    user_id: string;
}

export const useLandlordApplications = () => {
    const { user } = useAuth();
    const supabase = createClient();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchApplications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchApplications = async () => {
        try {
            // Join tenant_applications with profiles and properties
            const { data, error } = await supabase
                .from('tenant_applications')
                .select(`
                    id,
                    status,
                    income,
                    profession,
                    user_id,
                    property:properties(id, name),
                    profile:profiles(full_name)
                `)
                .eq('properties.owner_id', user?.id); // This requires a join filter which Supabase supports but might need RLS adjustment

            // Fallback for now: fetch all applications for properties owned by user
            // In a real app, we'd use a view or a more complex query
            const { data: properties } = await supabase
                .from('properties')
                .select('id')
                .eq('owner_id', user?.id);

            if (!properties?.length) {
                setApplicants([]);
                setLoading(false);
                return;
            }

            const propertyIds = properties.map(p => p.id);

            const { data: apps, error: appsError } = await supabase
                .from('tenant_applications')
                .select(`
                    id,
                    status,
                    income,
                    profession,
                    user_id,
                    property:properties(id, name)
                `)
                .in('property_id', propertyIds)
                .order('created_at', { ascending: false });

            if (appsError) throw appsError;

            // Fetch profile names separately if needed or assume they are in the application
            // For now, we'll mock the name if not joined, or fetch it

            const formattedApplicants: Applicant[] = await Promise.all((apps || []).map(async (app: any) => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', app.user_id)
                    .single();

                return {
                    id: app.id,
                    name: profile?.full_name || 'Unknown Applicant',
                    profession: app.profession,
                    income: app.income,
                    match: Math.floor(Math.random() * 20) + 80, // Mock match score for now as it requires AI calculation
                    status: app.status,
                    property: app.property?.name || 'Unknown Property',
                    property_id: app.property?.id,
                    user_id: app.user_id
                };
            }));

            setApplicants(formattedApplicants);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('tenant_applications')
                .update({ status })
                .eq('id', applicationId);

            if (error) throw error;

            setApplicants(prev => prev.map(app =>
                app.id === applicationId ? { ...app, status } : app
            ));

            toast.success(`Application ${status} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update application status');
        }
    };

    return { applicants, loading, updateStatus, refreshApplications: fetchApplications };
};

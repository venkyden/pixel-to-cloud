'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { Property } from '@/types';

export interface ApplicationWithProperty {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft';
    created_at: string;
    property: Property;
}

export const useTenantApplications = () => {
    const { user } = useAuth();
    const supabase = createClient();
    const [applications, setApplications] = useState<ApplicationWithProperty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchApplications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('tenant_applications')
                .select(`
                    id,
                    status,
                    created_at,
                    property:properties(*)
                `)
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedApplications = (data || []).map((app: any) => ({
                id: app.id,
                status: app.status,
                created_at: app.created_at,
                property: {
                    ...app.property,
                    amenities: app.property.amenities || [],
                    images: app.property.images || []
                }
            }));

            setApplications(formattedApplications);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    return { applications, loading, refreshApplications: fetchApplications };
};

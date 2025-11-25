'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { Property } from '@/types';
import { toast } from 'sonner';

export const useLandlordProperties = () => {
    const { user } = useAuth();
    const supabase = createClient();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProperties();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchProperties = async () => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('owner_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedProperties: Property[] = (data || []).map((prop: any) => ({
                id: Number(String(prop.id).split('-')[0]),
                name: String(prop.name),
                price: Number(prop.price),
                currency: String(prop.currency || '€'),
                rooms: Number(prop.rooms),
                location: String(prop.location),
                amenities: Array.isArray(prop.amenities) ? prop.amenities as string[] : [],
                description: String(prop.description || ''),
                neighborhood_rating: Number(prop.neighborhood_rating || 0),
                transport_score: Number(prop.transport_score || 0),
                legal_status: String(prop.legal_status || 'pending'),
                images: Array.isArray(prop.images) ? prop.images as string[] : []
            }));

            setProperties(formattedProperties);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProperty = async (property: Partial<Property>) => {
        // Implementation for adding property would go here
        toast.info("Add Property feature coming soon!");
    };

    return { properties, loading, addProperty, refreshProperties: fetchProperties };
};

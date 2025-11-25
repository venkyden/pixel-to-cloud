'use client'

import { useEffect, useState } from "react";
import { Property } from "@/types";
import { PropertyCard } from "@/components/properties/property-card";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface TenantMatchesProps {
    onSelectProperty: (property: Property) => void;
}

export const TenantMatches = ({ onSelectProperty }: TenantMatchesProps) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .limit(50);

            if (error) throw error;

            const formattedProperties: Property[] = (data || []).map((prop: Record<string, unknown>) => ({
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
                match_score: 0,
                match_reason: '',
                images: Array.isArray(prop.images) ? prop.images as string[] : [],
                coordinates: typeof prop.coordinates === 'object' ? prop.coordinates as { lat: number; lng: number } : undefined,
                reviews: []
            }));

            setProperties(formattedProperties);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground">Your Perfect Matches</h2>
                <p className="text-muted-foreground">AI-powered matching found {properties.length} properties for you</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                        onSelect={onSelectProperty}
                    />
                ))}
            </div>
        </div>
    );
};

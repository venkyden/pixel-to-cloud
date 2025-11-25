import { createClient } from "@/utils/supabase/server";
import { PropertiesClient } from "@/components/properties/properties-client";
import { Property } from "@/types";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Browse Properties | Roomivo",
    description: "Explore our curated selection of verified apartments and student housing in top French cities.",
};

export default async function PropertiesPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching properties:", error);
        // Handle error appropriately, maybe return empty list or error component
    }

    const formattedProperties: Property[] = (data || []).map((prop: any) => ({
        id: Number(String(prop.id).split('-')[0]), // Handle UUID to number conversion if needed, or change type
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
        match_reason: ''
    }));

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse floating" />
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            <PropertiesClient initialProperties={formattedProperties} />
        </div>
    );
}

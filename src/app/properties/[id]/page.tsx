import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Property } from "@/types";
import { ImageGallery } from "@/components/properties/image-gallery";
import { MapView } from "@/components/properties/map-view";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Home, Shield, FileText, Share2, Heart } from "lucide-react";
import Link from "next/link";

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = params;

    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        console.error("Error fetching property:", error);
        notFound();
    }

    const property: Property = {
        id: Number(String(data.id).split('-')[0]),
        name: String(data.name),
        price: Number(data.price),
        currency: String(data.currency || '€'),
        rooms: Number(data.rooms),
        location: String(data.location),
        amenities: Array.isArray(data.amenities) ? data.amenities as string[] : [],
        description: String(data.description || ''),
        neighborhood_rating: Number(data.neighborhood_rating || 0),
        transport_score: Number(data.transport_score || 0),
        legal_status: String(data.legal_status || 'pending'),
        images: Array.isArray(data.images) ? data.images as string[] : [],
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse floating" />
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="container py-8">
                <div className="mb-6">
                    <Link href="/properties" className="text-muted-foreground hover:text-primary transition-colors">
                        &larr; Back to Properties
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                                {property.name}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground text-lg">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{property.location}</span>
                            </div>
                        </div>

                        <ImageGallery images={property.images || []} />

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 glass-effect p-1">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="location">Location</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="space-y-6 mt-6">
                                <div className="glass-effect rounded-2xl p-6 space-y-4">
                                    <h3 className="text-xl font-semibold">Description</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {property.description}
                                    </p>
                                </div>

                                <div className="glass-effect rounded-2xl p-6 space-y-4">
                                    <h3 className="text-xl font-semibold">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {property.amenities.map((amenity) => (
                                            <Badge key={amenity} variant="secondary" className="px-3 py-1 text-sm">
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="location" className="mt-6">
                                <MapView address={property.location} />
                            </TabsContent>
                            <TabsContent value="reviews" className="mt-6">
                                <div className="glass-effect rounded-2xl p-6 text-center text-muted-foreground">
                                    No reviews yet for this property.
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-effect rounded-2xl p-6 sticky top-24 space-y-6 border-border/50 shadow-elegant">
                            <div className="space-y-2">
                                <div className="text-3xl font-bold text-primary">
                                    {property.currency}{property.price}
                                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Home className="w-4 h-4" />
                                    <span>{property.rooms} Rooms</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border/50">
                                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Apply Now
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Legal Check
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="ghost" className="w-full">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                    <Button variant="ghost" className="w-full">
                                        <Heart className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-sm font-semibold capitalize">Status: {property.legal_status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

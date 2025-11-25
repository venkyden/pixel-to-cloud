'use client'

import { useState, useMemo } from "react";
import { Property } from "@/types";
import { PropertyCard } from "@/components/properties/property-card";
import { FilterSidebar, FilterValues } from "@/components/properties/filter-sidebar";
import { AIPropertySearch } from "@/components/properties/ai-property-search";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Shield } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";

interface PropertiesClientProps {
    initialProperties: Property[];
}

export const PropertiesClient = ({ initialProperties }: PropertiesClientProps) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [aiMatches, setAiMatches] = useState<Array<{ id: number; score: number; reason: string }>>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [filters, setFilters] = useState<FilterValues>({});

    const displayProperties = useMemo(() => {
        let filtered = [...properties];

        if (filters.minPrice) {
            filtered = filtered.filter(p => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(p => p.price <= filters.maxPrice!);
        }
        if (filters.location) {
            filtered = filtered.filter(p =>
                p.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
        }
        if (filters.amenities && filters.amenities.length > 0) {
            filtered = filtered.filter(p =>
                filters.amenities!.every(amenity => p.amenities.includes(amenity))
            );
        }

        if (aiMatches.length > 0) {
            const updatedProperties = filtered.map(prop => {
                const match = aiMatches.find(m => m.id === prop.id);
                return match ? { ...prop, match_score: match.score, match_reason: match.reason } : prop;
            });

            const sortedProperties = updatedProperties
                .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
                .filter(p => (p.match_score || 0) > 0);

            return sortedProperties.length > 0 ? sortedProperties : updatedProperties;
        }

        return filtered;
    }, [filters, properties, aiMatches]);

    const handleAISearchResults = (matches: Array<{ id: number; score: number; reason: string }>) => {
        setAiMatches(matches);
    };

    return (
        <div className="container py-8 relative">
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Available Properties</h1>
                    <p className="text-muted-foreground text-lg">{displayProperties.length} properties found</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <div className="glass-effect rounded-2xl p-6 sticky top-24">
                        <FilterSidebar onFilterChange={setFilters} />
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="mb-6">
                        <AIPropertySearch
                            properties={properties}
                            onSearchResults={handleAISearchResults}
                        />
                    </div>
                    {displayProperties.length === 0 ? (
                        <div className="glass-effect rounded-2xl p-12 text-center">
                            <p className="text-muted-foreground text-lg">No properties available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayProperties.map((property) => (
                                <div key={property.id} className="relative animate-fade-in group">
                                    <div className="glass-effect rounded-2xl overflow-hidden hover:shadow-elegant transition-all duration-300 hover:scale-105">
                                        <PropertyCard
                                            property={property}
                                            onSelect={() => setSelectedProperty(property)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-effect border-border/50">
                    {selectedProperty && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">{selectedProperty.name}</DialogTitle>
                            </DialogHeader>
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 glass-effect p-1">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">Overview</TabsTrigger>
                                    <TabsTrigger value="gallery" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">Gallery</TabsTrigger>
                                    <TabsTrigger value="location" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">Location</TabsTrigger>
                                    <TabsTrigger value="reviews" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">Reviews</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-muted-foreground">{selectedProperty.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">Price</h4>
                                            <p className="text-muted-foreground">{selectedProperty.currency}{selectedProperty.price}/month</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Rooms</h4>
                                            <p className="text-muted-foreground">{selectedProperty.rooms}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProperty.amenities.map((amenity) => (
                                                <span key={amenity} className="px-3 py-1 bg-muted rounded-full text-sm">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {user && (
                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <Button className="flex-1">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Postuler
                                            </Button>
                                            <Button variant="outline" className="flex-1">
                                                <Shield className="w-4 h-4 mr-2" />
                                                Vérifier la conformité
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="gallery">
                                    <p className="text-center text-muted-foreground py-8">Gallery coming soon</p>
                                </TabsContent>
                                <TabsContent value="location">
                                    <p className="text-center text-muted-foreground py-8">Map view coming soon</p>
                                </TabsContent>
                                <TabsContent value="reviews" className="space-y-4">
                                    <p className="text-center text-muted-foreground py-8">No reviews yet for this property</p>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PropertyCard } from "@/components/PropertyCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ImageGallery } from "@/components/ImageGallery";
import { MapView } from "@/components/MapView";
import { ReviewCard } from "@/components/ReviewCard";
import { AIPropertySearch } from "@/components/AIPropertySearch";
import { AdvancedFilters, PropertyFilters } from "@/components/AdvancedFilters";
import { SavedSearches } from "@/components/SavedSearches";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Property } from "@/types";
import { toast } from "sonner";
import { GitCompare } from "lucide-react";

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [displayProperties, setDisplayProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Property[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({});

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, properties]);

  const applyFilters = () => {
    let filtered = [...properties];

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.minRooms) {
      filtered = filtered.filter(p => p.rooms >= filters.minRooms!);
    }
    if (filters.maxRooms) {
      filtered = filtered.filter(p => p.rooms <= filters.maxRooms!);
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
    if (filters.minTransportScore) {
      filtered = filtered.filter(p => p.transport_score >= filters.minTransportScore!);
    }
    if (filters.minNeighborhoodRating) {
      filtered = filtered.filter(p => p.neighborhood_rating >= filters.minNeighborhoodRating!);
    }
    if (filters.legalStatus) {
      filtered = filtered.filter(p => p.legal_status === filters.legalStatus);
    }

    setDisplayProperties(filtered);
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedProperties: Property[] = (data || []).map((prop: any) => ({
        id: Number(prop.id.split('-')[0]),
        name: prop.name,
        price: Number(prop.price),
        currency: prop.currency || '€',
        rooms: prop.rooms,
        location: prop.location,
        amenities: prop.amenities || [],
        description: prop.description || '',
        neighborhood_rating: prop.neighborhood_rating || 0,
        transport_score: prop.transport_score || 0,
        legal_status: prop.legal_status || 'pending',
        match_score: 0,
        match_reason: ''
      }));

      setProperties(formattedProperties);
      setDisplayProperties(formattedProperties);
    } catch (error: any) {
      toast.error("Failed to load properties");
      if (import.meta.env.DEV) console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAISearchResults = (matches: Array<{ id: number; score: number; reason: string }>) => {
    const updatedProperties = properties.map(prop => {
      const match = matches.find(m => m.id === prop.id);
      return match ? { ...prop, match_score: match.score, match_reason: match.reason } : prop;
    });
    
    const sortedProperties = updatedProperties
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .filter(p => (p.match_score || 0) > 0);
    
    setDisplayProperties(sortedProperties.length > 0 ? sortedProperties : updatedProperties);
  };

  const toggleCompareSelection = (property: Property) => {
    if (selectedForComparison.find((p) => p.id === property.id)) {
      setSelectedForComparison(selectedForComparison.filter((p) => p.id !== property.id));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison([...selectedForComparison, property]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Available Properties</h1>
            <p className="text-muted-foreground">{displayProperties.length} properties found</p>
          </div>
          <div className="flex gap-2">
            <SavedSearches onLoadSearch={setFilters} />
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSaveSearch={() => {}}
            />
            <Button
              variant={compareMode ? "default" : "outline"}
              onClick={() => setCompareMode(!compareMode)}
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Compare ({selectedForComparison.length})
            </Button>
          </div>
        </div>

        {compareMode && selectedForComparison.length > 1 && (
          <div className="mb-6">
            <ComparisonTable properties={selectedForComparison} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterSidebar />
          </div>

          <div className="lg:col-span-3">
            <AIPropertySearch 
              properties={properties} 
              onSearchResults={handleAISearchResults}
            />
            {displayProperties.length === 0 ? (
              <p className="text-muted-foreground">No properties available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayProperties.map((property) => (
                  <div key={property.id} className="relative">
                    {compareMode && (
                      <div className="absolute top-4 right-4 z-10">
                        <input
                          type="checkbox"
                          checked={!!selectedForComparison.find((p) => p.id === property.id)}
                          onChange={() => toggleCompareSelection(property)}
                          className="w-5 h-5"
                        />
                      </div>
                    )}
                    <PropertyCard
                      property={property}
                      onSelect={() => !compareMode && setSelectedProperty(property)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProperty && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedProperty.name}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
                  </TabsContent>
                  <TabsContent value="gallery">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                      <ImageGallery images={selectedProperty.images} />
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No images available for this property</p>
                    )}
                  </TabsContent>
                  <TabsContent value="location">
                    <MapView address={selectedProperty.location} />
                  </TabsContent>
                  <TabsContent value="reviews" className="space-y-4">
                    <p className="text-center text-muted-foreground py-8">No reviews yet for this property</p>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}

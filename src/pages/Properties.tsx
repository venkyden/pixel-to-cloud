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
import { TenantApplicationForm } from "@/components/TenantApplicationForm";
import { PropertyLegalChecks } from "@/components/PropertyLegalChecks";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Property } from "@/types";
import { toast } from "sonner";
import { GitCompare, FileText, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [displayProperties, setDisplayProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Property[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showLegalChecks, setShowLegalChecks] = useState(false);
  const [selectedPropertyForAction, setSelectedPropertyForAction] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
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
  }, [filters, properties]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

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
        match_reason: ''
      }));

      setProperties(formattedProperties);
      setDisplayProperties(formattedProperties);
    } catch (error: unknown) {
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse floating" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <Header />
      <main className="flex-1 container py-8 relative">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Available Properties</h1>
            <p className="text-muted-foreground text-lg">{displayProperties.length} properties found</p>
          </div>
          <div className="flex gap-2">
            <SavedSearches onLoadSearch={setFilters} />
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSaveSearch={() => { }}
            />
            <Button
              variant={compareMode ? "default" : "outline"}
              onClick={() => setCompareMode(!compareMode)}
              className="glass-effect hover:scale-105 transition-all duration-300"
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Compare ({selectedForComparison.length})
            </Button>
          </div>
        </div>

        {compareMode && selectedForComparison.length > 1 && (
          <div className="mb-6 animate-fade-in">
            <ComparisonTable properties={selectedForComparison} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl p-6 sticky top-24">
              <FilterSidebar />
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
                    {compareMode && (
                      <div className="absolute top-4 right-4 z-10">
                        <input
                          type="checkbox"
                          checked={!!selectedForComparison.find((p) => p.id === property.id)}
                          onChange={() => toggleCompareSelection(property)}
                          className="w-5 h-5 rounded glass-effect"
                        />
                      </div>
                    )}
                    <div className="glass-effect rounded-2xl overflow-hidden hover:shadow-elegant transition-all duration-300 hover:scale-105">
                      <PropertyCard
                        property={property}
                        onSelect={() => !compareMode && setSelectedProperty(property)}
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
                        <Button
                          onClick={() => {
                            setSelectedPropertyForAction(selectedProperty);
                            setShowApplicationForm(true);
                            setSelectedProperty(null);
                          }}
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Postuler
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPropertyForAction(selectedProperty);
                            setShowLegalChecks(true);
                            setSelectedProperty(null);
                          }}
                          className="flex-1"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Vérifier la conformité
                        </Button>
                      </div>
                    )}
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

        <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedPropertyForAction && (
              <TenantApplicationForm
                propertyId={String(selectedPropertyForAction.id)}
                propertyName={selectedPropertyForAction.name}
                propertyPrice={selectedPropertyForAction.price}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showLegalChecks} onOpenChange={setShowLegalChecks}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vérification de conformité légale</DialogTitle>
            </DialogHeader>
            {selectedPropertyForAction && (
              <PropertyLegalChecks
                propertyId={String(selectedPropertyForAction.id)}
                price={selectedPropertyForAction.price}
                location={selectedPropertyForAction.location}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}

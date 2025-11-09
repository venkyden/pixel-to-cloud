import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PropertyCard } from "@/components/PropertyCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ImageGallery } from "@/components/ImageGallery";
import { MapView } from "@/components/MapView";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { properties } from "@/data/mockData";
import { Property } from "@/types";
import { GitCompare } from "lucide-react";

export default function Properties() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Property[]>([]);

  const mockImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  ];

  const mockReviews = [
    {
      authorName: "Alice Brown",
      rating: 5,
      date: "2 weeks ago",
      comment: "Great location and amenities. The landlord is very responsive!",
    },
    {
      authorName: "Bob Smith",
      rating: 4,
      date: "1 month ago",
      comment: "Nice apartment, but parking can be tricky during peak hours.",
    },
  ];

  const toggleCompareSelection = (property: Property) => {
    if (selectedForComparison.find((p) => p.id === property.id)) {
      setSelectedForComparison(selectedForComparison.filter((p) => p.id !== property.id));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison([...selectedForComparison, property]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Available Properties</h1>
            <p className="text-muted-foreground">{properties.length} properties found</p>
          </div>
          <div className="flex gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
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
                        <p className="text-muted-foreground">${selectedProperty.price}/month</p>
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
                    <ImageGallery images={mockImages} />
                  </TabsContent>
                  <TabsContent value="location">
                    <MapView address={selectedProperty.location} />
                  </TabsContent>
                  <TabsContent value="reviews" className="space-y-4">
                    {mockReviews.map((review, idx) => (
                      <ReviewCard key={idx} {...review} />
                    ))}
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

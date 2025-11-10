import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  location?: string;
  amenities?: string[];
  minTransportScore?: number;
  minNeighborhoodRating?: number;
  legalStatus?: string;
}

interface AdvancedFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onSaveSearch?: () => void;
}

const commonAmenities = [
  "WiFi",
  "Parking",
  "Balcony",
  "Elevator",
  "Furnished",
  "Pet-friendly",
  "Garden",
  "Gym",
];

export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  onSaveSearch,
}: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAmenityToggle = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onFiltersChange({ ...filters, amenities: updated });
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save searches",
        variant: "destructive",
      });
      return;
    }

    if (!searchName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this search",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("saved_searches").insert([{
        user_id: user.id,
        name: searchName,
        filters: filters as any,
      }]);

      if (error) throw error;

      toast({
        title: "Search saved",
        description: `"${searchName}" has been saved successfully`,
      });
      setSearchName("");
      onSaveSearch?.();
    } catch (error) {
      console.error("Error saving search:", error);
      toast({
        title: "Error",
        description: "Failed to save search",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your property search with detailed criteria
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range (€)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="space-y-2">
            <Label>Number of Rooms</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minRooms || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minRooms: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxRooms || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxRooms: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Enter location"
              value={filters.location || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, location: e.target.value })
              }
            />
          </div>

          {/* Transport Score */}
          <div className="space-y-2">
            <Label>Minimum Transport Score: {filters.minTransportScore || 0}</Label>
            <Slider
              value={[filters.minTransportScore || 0]}
              onValueChange={([value]) =>
                onFiltersChange({ ...filters, minTransportScore: value })
              }
              max={10}
              step={1}
            />
          </div>

          {/* Neighborhood Rating */}
          <div className="space-y-2">
            <Label>
              Minimum Neighborhood Rating: {filters.minNeighborhoodRating || 0}
            </Label>
            <Slider
              value={[filters.minNeighborhoodRating || 0]}
              onValueChange={([value]) =>
                onFiltersChange({ ...filters, minNeighborhoodRating: value })
              }
              max={10}
              step={1}
            />
          </div>

          {/* Legal Status */}
          <div className="space-y-2">
            <Label>Legal Status</Label>
            <Select
              value={filters.legalStatus || "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  legalStatus: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities?.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <label
                    htmlFor={amenity}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Search */}
          {user && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Save This Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <Button
                  onClick={handleSaveSearch}
                  disabled={isSaving || !searchName.trim()}
                  size="icon"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={() => setIsOpen(false)} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

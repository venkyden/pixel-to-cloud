import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface FilterSidebarProps {
  onFilterChange?: (filters: any) => void;
}

export const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Location</Label>
          <Input placeholder="City, neighborhood..." />
        </div>

        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex items-center gap-2 mb-2">
            <Input type="number" placeholder="Min" />
            <span className="text-muted-foreground">-</span>
            <Input type="number" placeholder="Max" />
          </div>
          <Slider defaultValue={[1000, 3000]} max={5000} step={100} />
        </div>

        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <div className="flex gap-2">
            {["Studio", "1", "2", "3", "4+"].map((bed) => (
              <Button key={bed} variant="outline" size="sm" className="flex-1">
                {bed}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Amenities</Label>
          <div className="space-y-2">
            {["Pet Friendly", "Parking", "Gym", "Pool", "Laundry"].map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox id={amenity} />
                <label htmlFor={amenity} className="text-sm text-muted-foreground cursor-pointer">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full">Apply Filters</Button>
          <Button variant="outline" className="w-full">Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
};

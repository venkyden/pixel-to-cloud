'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export interface FilterValues {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: string;
    amenities?: string[];
    minRooms?: number;
    maxRooms?: number;
    minTransportScore?: number;
    minNeighborhoodRating?: number;
    legalStatus?: string;
}

interface FilterSidebarProps {
    onFilterChange?: (filters: FilterValues) => void;
}

export const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
    const [filters, setFilters] = useState<FilterValues>({});

    const handleInputChange = (key: keyof FilterValues, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleAmenityChange = (amenity: string, checked: boolean) => {
        const currentAmenities = filters.amenities || [];
        const newAmenities = checked
            ? [...currentAmenities, amenity]
            : currentAmenities.filter((a) => a !== amenity);

        handleInputChange("amenities", newAmenities);
    };

    return (
        <Card className="glass-effect border-border/50 shadow-elegant">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <SlidersHorizontal className="h-5 w-5 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
                        Filters
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Location</Label>
                    <Input
                        placeholder="City, neighborhood..."
                        className="glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                        onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Price Range</Label>
                    <div className="flex items-center gap-2 mb-3">
                        <Input
                            type="number"
                            placeholder="Min"
                            className="glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                            onChange={(e) => handleInputChange("minPrice", Number(e.target.value))}
                        />
                        <span className="text-muted-foreground font-medium">-</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            className="glass-effect border-border/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                            onChange={(e) => handleInputChange("maxPrice", Number(e.target.value))}
                        />
                    </div>
                    <div className="px-2">
                        <Slider
                            defaultValue={[1000, 3000]}
                            max={5000}
                            step={100}
                            className="cursor-pointer"
                            onValueChange={(value) => {
                                handleInputChange("minPrice", value[0]);
                                handleInputChange("maxPrice", value[1]);
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Bedrooms</Label>
                    <div className="flex gap-2">
                        {["Studio", "1", "2", "3", "4+"].map((bed) => (
                            <Button
                                key={bed}
                                variant={filters.bedrooms === bed ? "default" : "outline"}
                                size="sm"
                                className={`flex-1 glass-effect border-border/50 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 ${filters.bedrooms === bed ? "bg-primary text-primary-foreground" : ""}`}
                                onClick={() => handleInputChange("bedrooms", bed)}
                            >
                                {bed}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Amenities</Label>
                    <div className="space-y-3 p-4 rounded-xl glass-effect border border-border/50">
                        {["Pet Friendly", "Parking", "Gym", "Pool", "Laundry"].map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-3 group">
                                <Checkbox
                                    id={amenity}
                                    className="border-border/50 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent transition-all duration-300"
                                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                                />
                                <label
                                    htmlFor={amenity}
                                    className="text-sm text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors duration-300 font-medium"
                                >
                                    {amenity}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <Button
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                        onClick={() => onFilterChange?.(filters)}
                    >
                        Apply Filters
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full glass-effect border-border/50 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                        onClick={() => {
                            setFilters({});
                            onFilterChange?.({});
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

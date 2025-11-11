import { Property } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home, TrendingUp, Shield } from "lucide-react";
import { amenityLabels } from "@/data/amenities";

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard = ({ property, onSelect }: PropertyCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1 text-foreground">{property.name}</h3>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            <span>{property.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {property.currency}{property.price}
          </div>
          <div className="text-xs text-muted-foreground">per month</div>
        </div>
      </div>

      <div className="mb-4">
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          <TrendingUp className="w-3 h-3 mr-1" />
          {property.match_score}% Match
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{property.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-xs">
          <Home className="w-3 h-3 mr-1" />
          {property.rooms} rooms
        </Badge>
        {property.amenities.map((amenity) => (
          <Badge key={amenity} variant="outline" className="text-xs">
            {amenityLabels[amenity] || amenity}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-xs text-success font-medium">{property.legal_status}</span>
        </div>
        <Button onClick={() => onSelect(property)}>View Details</Button>
      </div>
    </Card>
  );
};

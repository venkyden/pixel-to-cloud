import { Property } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home, TrendingUp, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard = ({ property, onSelect }: PropertyCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="group relative overflow-hidden glass-effect border-border/50 hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] cursor-pointer">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              {property.name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{property.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {property.currency}{property.price}
            </div>
            <div className="text-xs text-muted-foreground font-medium">{t("property.perMonth")}</div>
          </div>
        </div>

        {/* Match Score Badge */}
        {property.match_score > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="glass-effect bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30 hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              {property.match_score}% {t("property.match")}
            </Badge>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {property.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="glass-effect border-border/50 hover:border-primary/50 transition-colors duration-300">
            <Home className="w-3 h-3 mr-1 text-primary" />
            {property.rooms} {t("property.rooms")}
          </Badge>
          {property.amenities.slice(0, 3).map((amenity) => (
            <Badge 
              key={amenity} 
              variant="outline" 
              className="glass-effect border-border/50 hover:border-accent/50 transition-colors duration-300"
            >
              {t(`amenities.${amenity}`) || amenity}
            </Badge>
          ))}
          {property.amenities.length > 3 && (
            <Badge variant="outline" className="glass-effect border-border/50">
              +{property.amenities.length - 3}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-effect">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-semibold capitalize">{property.legal_status}</span>
          </div>
          <Button 
            onClick={() => onSelect(property)}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            {t("property.viewDetails")}
          </Button>
        </div>
      </div>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Property } from "@/types";

interface ComparisonTableProps {
  properties: Property[];
}

export const ComparisonTable = ({ properties }: ComparisonTableProps) => {
  const features = [
    "Rent",
    "Rooms",
    "Bathrooms",
    "Pet Friendly",
    "Parking",
    "Gym",
    "Pool",
    "Security",
  ];

  const getFeatureValue = (property: Property, feature: string) => {
    switch (feature) {
      case "Rent":
        return `$${property.price}/mo`;
      case "Rooms":
        return property.rooms;
      case "Bathrooms":
        return "2";
      case "Pet Friendly":
        return property.amenities.includes("Pet Friendly") ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />;
      case "Parking":
        return property.amenities.includes("Parking") ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />;
      case "Gym":
        return property.amenities.includes("Gym") ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />;
      case "Pool":
        return property.amenities.includes("Pool") ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />;
      case "Security":
        return property.amenities.includes("Security") ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return "-";
    }
  };

  return (
    <Card className="glass-effect border-border/50 shadow-elegant overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative">
        <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold text-2xl">
          Property Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-bold text-foreground">Feature</th>
                {properties.map((property) => (
                  <th key={property.id} className="p-4 text-center min-w-[200px]">
                    <div className="space-y-3 p-4 rounded-xl glass-effect border border-border/50">
                      <p className="font-bold text-foreground">{property.name}</p>
                      <p className="text-sm text-muted-foreground font-medium">{property.location}</p>
                      <Badge className="glass-effect bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30">
                        {property.match_score}% Match
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={feature} 
                  className="border-b border-border/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="p-4 font-semibold text-muted-foreground">{feature}</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        {getFeatureValue(property, feature)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4"></td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                      View Details
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

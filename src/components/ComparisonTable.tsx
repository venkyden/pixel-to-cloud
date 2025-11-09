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
    <Card>
      <CardHeader>
        <CardTitle>Property Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                {properties.map((property) => (
                  <th key={property.id} className="p-4 text-center">
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">{property.name}</p>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                      <Badge>{property.match_score}% Match</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature} className="border-b">
                  <td className="p-4 font-medium text-muted-foreground">{feature}</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-4 text-center">
                      {getFeatureValue(property, feature)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4"></td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    <Button className="w-full">View Details</Button>
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

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { amenityKeys } from "@/data/amenities";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, ArrowRight } from "lucide-react";

interface PropertyListingProps {
  onSubmit: () => void;
}

export const PropertyListing = ({ onSubmit }: PropertyListingProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Home className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create Property Listing</h2>
          <p className="text-sm text-muted-foreground">Add your property details for AI-powered tenant matching</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <div className="space-y-2">
          <Label>Property Name</Label>
          <Input placeholder="e.g., Cozy Apartment in Marais" required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Monthly Rent (€)</Label>
            <Input type="number" placeholder="850" required />
          </div>
          <div className="space-y-2">
            <Label>Number of Rooms</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Studio / 1 Room</SelectItem>
                <SelectItem value="2">2 Rooms</SelectItem>
                <SelectItem value="3">3 Rooms</SelectItem>
                <SelectItem value="4">4+ Rooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input placeholder="e.g., Paris, Marais District" required />
        </div>

        <div className="space-y-2">
          <Label>Property Description</Label>
          <Textarea 
            placeholder="Describe your property, its features, and neighborhood..."
            rows={4}
            required
          />
        </div>

        <div className="space-y-3">
          <Label>Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenityKeys.map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox id={`landlord-${key}`} />
                <label htmlFor={`landlord-${key}`} className="text-sm cursor-pointer">
                  {t(`amenities.${key}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Available From</Label>
          <Input type="date" required />
        </div>

        <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
          <p className="text-sm text-foreground">
            <strong>AI Matching:</strong> Your listing will be automatically matched with verified tenants based on their preferences and your requirements.
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Publish Listing & Find Tenants
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};

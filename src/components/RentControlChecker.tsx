import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Scale } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RentControlResult {
  isCompliant: boolean;
  maxAllowedRent: number;
  proposedRent: number;
  zone: string;
  message: string;
}

export const RentControlChecker = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RentControlResult | null>(null);
  const [formData, setFormData] = useState({
    city: "",
    postalCode: "",
    surface: "",
    rentAmount: "",
    furnished: "false",
  });

  // French rent control zones (simplified - real implementation would use comprehensive database)
  const RENT_CONTROL_ZONES: Record<string, { maxPerM2: number; cities: string[] }> = {
    "zone_tendue": {
      maxPerM2: 26.5, // €/m² for Paris
      cities: ["Paris", "Lyon", "Bordeaux", "Marseille", "Lille", "Montpellier", "Toulouse"]
    },
    "zone_normale": {
      maxPerM2: 18.0, // €/m² for other cities
      cities: []
    }
  };

  const handleCheck = () => {
    setLoading(true);
    
    try {
      const surface = parseFloat(formData.surface);
      const rent = parseFloat(formData.rentAmount);
      const isFurnished = formData.furnished === "true";
      
      if (isNaN(surface) || isNaN(rent) || surface <= 0 || rent <= 0) {
        throw new Error("Please enter valid numbers for surface and rent");
      }

      // Determine zone
      const isControlledCity = RENT_CONTROL_ZONES.zone_tendue.cities.some(
        city => formData.city.toLowerCase().includes(city.toLowerCase())
      );
      
      const zone = isControlledCity ? "zone_tendue" : "zone_normale";
      let maxPerM2 = RENT_CONTROL_ZONES[zone].maxPerM2;
      
      // Furnished apartments can have +15% rent
      if (isFurnished) {
        maxPerM2 *= 1.15;
      }
      
      const maxAllowedRent = surface * maxPerM2;
      const rentPerM2 = rent / surface;
      const isCompliant = rent <= maxAllowedRent;
      
      const excessPercentage = ((rent - maxAllowedRent) / maxAllowedRent * 100).toFixed(1);
      
      let message = "";
      if (isCompliant) {
        message = `✓ This rent is compliant with French law. You are ${((maxAllowedRent - rent) / maxAllowedRent * 100).toFixed(1)}% below the maximum.`;
      } else {
        message = `⚠ This rent exceeds the legal maximum by ${excessPercentage}%. You must reduce it to comply with the law.`;
      }

      setResult({
        isCompliant,
        maxAllowedRent: Math.round(maxAllowedRent),
        proposedRent: rent,
        zone: zone === "zone_tendue" ? "Rent-Controlled Zone" : "Normal Zone",
        message
      });
    } catch (error: any) {
      console.error("Error checking rent control:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Rent Control Compliance Checker
        </CardTitle>
        <CardDescription>
          Verify if your rent complies with French law (Loi ALUR)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Paris"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="e.g., 75001"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surface">Surface Area (m²)</Label>
              <Input
                id="surface"
                type="number"
                placeholder="e.g., 45"
                value={formData.surface}
                onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent (€)</Label>
              <Input
                id="rentAmount"
                type="number"
                placeholder="e.g., 950"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="furnished">Type</Label>
            <Select value={formData.furnished} onValueChange={(value) => setFormData({ ...formData, furnished: value })}>
              <SelectTrigger id="furnished">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Unfurnished</SelectItem>
                <SelectItem value="true">Furnished (+15% allowed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleCheck} 
          disabled={loading || !formData.city || !formData.surface || !formData.rentAmount}
          className="w-full"
        >
          {loading ? "Checking..." : "Check Compliance"}
        </Button>

        {result && (
          <Alert className={result.isCompliant ? "border-success bg-success/10" : "border-destructive bg-destructive/10"}>
            <div className="flex items-start gap-3">
              {result.isCompliant ? (
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1 space-y-3">
                <AlertDescription className="font-medium">
                  {result.message}
                </AlertDescription>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Proposed Rent</p>
                    <p className="font-semibold text-lg">{result.proposedRent} €</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Legal Maximum</p>
                    <p className="font-semibold text-lg">{result.maxAllowedRent} €</p>
                  </div>
                </div>
                <Badge variant={result.isCompliant ? "default" : "destructive"}>
                  {result.zone}
                </Badge>
              </div>
            </div>
          </Alert>
        )}

        <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
          <p className="font-medium">📋 Important Legal Information</p>
          <ul className="space-y-1 text-muted-foreground ml-4">
            <li>• Rent control (encadrement des loyers) applies in designated zones</li>
            <li>• Paris, Lyon, and other major cities have strict rent caps</li>
            <li>• Furnished apartments can charge up to 15% more</li>
            <li>• Violations can result in fines and mandatory rent reductions</li>
            <li>• Always verify with official government data for legal compliance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Phone, Bell, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SMS_PHONE_REGEX = /^\+33[1-9]\d{8}$/;

export const SMSNotifications = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(true);
  const [phoneError, setPhoneError] = useState("");

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, '');
    
    if (!SMS_PHONE_REGEX.test(cleaned)) {
      return false;
    }
    
    const mobilePrefix = cleaned.substring(3, 4);
    if (mobilePrefix !== '6' && mobilePrefix !== '7') {
      toast.warning("Note: SMS notifications work best with mobile numbers (starting with +33 6 or +33 7)");
    }
    
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    if (value && !validatePhoneNumber(value.replace(/[\s-]/g, ''))) {
      setPhoneError("Invalid format. Use: +33 6 12 34 56 78");
    } else {
      setPhoneError("");
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    if (smsEnabled && phoneNumber) {
      const cleaned = phoneNumber.replace(/[\s-]/g, '');
      
      if (!validatePhoneNumber(cleaned)) {
        toast.error("Invalid French phone number. Use format: +33 6 12 34 56 78");
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: phoneNumber.replace(/[\s-]/g, ''),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("SMS notification preferences saved");
    } catch (error: any) {
      console.error("Error saving SMS preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          SMS Notifications
        </CardTitle>
        <CardDescription>
          Configure SMS alerts for urgent notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className={phoneError ? "border-destructive" : ""}
            />
            {phoneError && (
              <p className="text-xs text-destructive">{phoneError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your phone number with country code (e.g., +33 for France)
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="sms-enabled" className="text-base">
                Enable SMS Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive text messages for important updates
              </p>
            </div>
            <Switch
              id="sms-enabled"
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
            />
          </div>

          {smsEnabled && (
            <div className="flex items-center justify-between space-x-2 pl-4 border-l-2 border-primary/20">
              <div className="space-y-0.5">
                <Label htmlFor="urgent-only" className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Urgent Only
                </Label>
                <p className="text-xs text-muted-foreground">
                  Only send SMS for critical alerts (lease terminations, payment failures, safety incidents)
                </p>
              </div>
              <Switch
                id="urgent-only"
                checked={urgentOnly}
                onCheckedChange={setUrgentOnly}
              />
            </div>
          )}
        </div>

        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Bell className="h-4 w-4 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">SMS Notification Types</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Lease termination notices</li>
                <li>• Payment failures or declined cards</li>
                <li>• Safety or emergency incidents</li>
                <li>• Contract signature required</li>
                <li>• Application deadline expiring (24h)</li>
              </ul>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSavePreferences} 
          disabled={loading || !phoneNumber}
          className="w-full"
        >
          {loading ? "Saving..." : "Save SMS Preferences"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          SMS notifications are currently in development. You will receive email notifications for all events.
        </p>
      </CardContent>
    </Card>
  );
};

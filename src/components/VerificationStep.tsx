import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle2, ArrowRight, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const verificationSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
  ownershipDoc: z.instanceof(File)
    .refine((file) => file.size <= 10485760, "File must be less than 10MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type),
      "Only PDF, JPG, and PNG files are allowed"
    ),
  governmentId: z.instanceof(File)
    .refine((file) => file.size <= 10485760, "File must be less than 10MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type),
      "Only PDF, JPG, and PNG files are allowed"
    )
});

interface VerificationStepProps {
  onVerify: () => void;
}

export const VerificationStep = ({ onVerify }: VerificationStepProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ownershipDoc, setOwnershipDoc] = useState<File | null>(null);
  const [governmentId, setGovernmentId] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file: File, userId: string, type: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ownershipDoc || !governmentId) {
      toast.error("Please upload both required documents");
      return;
    }

    setLoading(true);

    try {
      // Validate form data
      const validatedData = verificationSchema.parse({
        fullName,
        email,
        phone,
        ownershipDoc,
        governmentId
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload files to storage
      toast.info("Uploading documents...");
      const [ownershipUrl, idUrl] = await Promise.all([
        uploadFile(validatedData.ownershipDoc, user.id, 'ownership'),
        uploadFile(validatedData.governmentId, user.id, 'government-id')
      ]);

      // Save verification record with document URLs
      const { error } = await supabase
        .from("landlord_verifications")
        .insert({
          user_id: user.id,
          full_name: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          ownership_document_url: ownershipUrl,
          government_id_url: idUrl,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Verification submitted! You'll be notified once approved.");
      onVerify();
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Verification error:", error);
        toast.error("Failed to submit verification. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Landlord Verification</h2>
          <p className="text-sm text-muted-foreground">Verify your identity to ensure tenant trust</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
        <h3 className="font-semibold mb-2 text-foreground">Why Verification Matters</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Builds trust with potential tenants</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Increases response rates by 3x</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Protects against fraud</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Required for legal compliance</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              placeholder="John Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Property Ownership Document *</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setOwnershipDoc(e.target.files?.[0] || null)}
              required
            />
            {ownershipDoc && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">
            Upload proof of ownership or authorization to rent (Max 10MB, PDF/JPG/PNG)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Government-Issued ID *</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setGovernmentId(e.target.files?.[0] || null)}
              required
            />
            {governmentId && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">
            Passport, national ID, or driver's license (Max 10MB, PDF/JPG/PNG)
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Submitting..." : "Complete Verification"}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};

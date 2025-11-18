import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";

interface ElectronicSignatureProps {
  onSign: (signatureData: string) => void;
  signerName: string;
  documentType: string;
  disabled?: boolean;
  existingSignature?: string;
}

export const ElectronicSignature = ({
  onSign,
  signerName,
  documentType,
  disabled = false,
  existingSignature,
}: ElectronicSignatureProps) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Please provide a signature");
      return;
    }

    const signatureData = sigCanvas.current?.toDataURL("image/png");
    if (signatureData) {
      onSign(signatureData);
      toast.success("Signature saved successfully");
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  if (existingSignature) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-5 h-5" />
            Signed by {signerName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-success/20 rounded-lg p-4 bg-background">
            <img 
              src={existingSignature} 
              alt={`Signature of ${signerName}`}
              className="max-h-32 mx-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {documentType} signed electronically
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-5 h-5" />
          Sign {documentType}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-4 bg-accent/5">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-32 touch-none",
              style: { border: "none" }
            }}
            onBegin={handleBegin}
            backgroundColor="transparent"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isEmpty || disabled}
            className="flex-1"
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isEmpty || disabled}
            className="flex-1"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Sign Document
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• By signing, {signerName} agrees to the {documentType}</p>
          <p>• Electronic signatures have the same legal value as handwritten signatures</p>
          <p>• Timestamp: {new Date().toLocaleString("fr-FR")}</p>
        </div>
      </CardContent>
    </Card>
  );
};

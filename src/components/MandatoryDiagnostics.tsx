import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiagnosticData {
  fileUrl?: string;
  uploadedAt?: string;
  date?: string;
}

interface DiagnosticsCollection {
  [key: string]: DiagnosticData;
}

interface MandatoryDiagnosticsProps {
  propertyId: string;
  onComplete?: (diagnostics: DiagnosticsCollection) => void;
  readOnly?: boolean;
}

const REQUIRED_DIAGNOSTICS = [
  {
    key: "dpe",
    name: "DPE (Diagnostic de Performance Énergétique)",
    description: "Évaluation de la consommation énergétique et des émissions de GES",
    required: true,
    validityYears: 10,
  },
  {
    key: "amiante",
    name: "Amiante",
    description: "Pour les bâtiments construits avant 1997",
    required: true,
    validityYears: null, // Permanent if negative
  },
  {
    key: "plomb",
    name: "CREP (Constat de Risque d'Exposition au Plomb)",
    description: "Pour les logements construits avant 1949",
    required: true,
    validityYears: 6,
  },
  {
    key: "termites",
    name: "État Parasitaire (Termites)",
    description: "Dans les zones déclarées à risque",
    required: false,
    validityYears: 0.5, // 6 months
  },
  {
    key: "gaz",
    name: "État de l'Installation Intérieure de Gaz",
    description: "Pour installations > 15 ans",
    required: true,
    validityYears: 3,
  },
  {
    key: "electricite",
    name: "État de l'Installation Intérieure d'Électricité",
    description: "Pour installations > 15 ans",
    required: true,
    validityYears: 3,
  },
  {
    key: "risques",
    name: "ERP (État des Risques et Pollutions)",
    description: "Risques naturels, miniers, technologiques, sismiques et radon",
    required: true,
    validityYears: 0.5, // 6 months
  },
  {
    key: "assainissement",
    name: "Assainissement Non Collectif",
    description: "Si le logement n'est pas raccordé au réseau public",
    required: false,
    validityYears: 3,
  },
];

export const MandatoryDiagnostics = ({
  propertyId,
  onComplete,
  readOnly = false,
}: MandatoryDiagnosticsProps) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsCollection>({});
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});

  useEffect(() => {
    fetchDiagnostics();
  }, [propertyId]);

  const fetchDiagnostics = async () => {
    try {
      const { data } = await supabase
        .from("property_diagnostics")
        .select("*")
        .eq("property_id", propertyId)
        .maybeSingle();

      if (data) {
        setDiagnostics((data.diagnostics as unknown as DiagnosticsCollection) || {});
      }
    } catch (error) {
      console.error("Error fetching diagnostics:", error);
    }
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  const uploadFile = async (key: string, file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${propertyId}/${key}_${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updatedDiagnostics = { ...diagnostics };

      // Upload all files
      for (const [key, file] of Object.entries(files)) {
        const url = await uploadFile(key, file);
        updatedDiagnostics[key] = {
          ...updatedDiagnostics[key],
          fileUrl: url,
          uploadedAt: new Date().toISOString(),
        };
      }

      // Save to database
      const { error } = await supabase
        .from("property_diagnostics")
        .upsert({
          property_id: propertyId,
          diagnostics: updatedDiagnostics as unknown as Record<string, never>,
        });

      if (error) throw error;

      toast.success("Diagnostics saved successfully");
      setFiles({});
      fetchDiagnostics();
      onComplete?.(updatedDiagnostics);
    } catch (error: unknown) {
      console.error("Error saving diagnostics:", error);
      toast.error("Failed to save diagnostics");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (key: string, date: string) => {
    setDiagnostics((prev: DiagnosticsCollection) => ({
      ...prev,
      [key]: {
        ...prev[key],
        date,
      },
    }));
  };

  const isExpired = (diagnostic: DiagnosticData | undefined, validityYears: number | null) => {
    if (!diagnostic?.date || validityYears === null) return false;
    const expiryDate = new Date(diagnostic.date);
    expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);
    return expiryDate < new Date();
  };

  const getCompletionStatus = () => {
    const required = REQUIRED_DIAGNOSTICS.filter((d) => d.required);
    const completed = required.filter(
      (d) => diagnostics[d.key]?.fileUrl && diagnostics[d.key]?.date
    );
    return { completed: completed.length, total: required.length };
  };

  const status = getCompletionStatus();
  const isComplete = status.completed === status.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Diagnostics Immobiliers Obligatoires
          </span>
          <Badge
            variant={isComplete ? "default" : "secondary"}
            className={isComplete ? "bg-success" : ""}
          >
            {status.completed}/{status.total} Required
          </Badge>
        </CardTitle>
        <CardDescription>
          Conformément à la loi ALUR et au Code de la Construction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ces diagnostics sont <strong>obligatoires</strong> avant toute location en France.
            Leur absence peut entraîner des sanctions pénales et l'annulation du bail.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {REQUIRED_DIAGNOSTICS.map((diag) => {
            const current = diagnostics[diag.key];
            const hasFile = current?.fileUrl;
            const hasDate = current?.date;
            const expired = isExpired(current, diag.validityYears);

            return (
              <Card
                key={diag.key}
                className={`${hasFile && hasDate && !expired
                  ? "border-success/20 bg-success/5"
                  : diag.required
                    ? "border-warning/20 bg-warning/5"
                    : ""
                  }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {diag.name}
                        {diag.required && (
                          <Badge variant="destructive" className="text-xs">
                            Obligatoire
                          </Badge>
                        )}
                        {hasFile && hasDate && !expired && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                        {expired && <AlertTriangle className="w-4 h-4 text-warning" />}
                      </CardTitle>
                      <CardDescription className="text-xs">{diag.description}</CardDescription>
                      {diag.validityYears && (
                        <p className="text-xs text-muted-foreground">
                          Validité: {diag.validityYears === 0.5 ? "6 mois" : `${diag.validityYears} ans`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!readOnly && (
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`${diag.key}-date`} className="text-xs">
                          Date du diagnostic
                        </Label>
                        <Input
                          id={`${diag.key}-date`}
                          type="date"
                          value={current?.date || ""}
                          onChange={(e) => handleDateChange(diag.key, e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${diag.key}-file`} className="text-xs">
                          Document PDF
                        </Label>
                        <Input
                          id={`${diag.key}-file`}
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            handleFileChange(diag.key, e.target.files?.[0] || null)
                          }
                        />
                      </div>
                    </div>
                    {hasFile && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        Document uploaded
                        {expired && (
                          <Badge variant="outline" className="text-warning border-warning">
                            Expiré - Renouvellement requis
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
                {readOnly && hasFile && (
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <a href={current.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-3 h-3 mr-2" />
                        View Document
                      </a>
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {!readOnly && (
          <Button
            onClick={handleSubmit}
            disabled={loading || Object.keys(files).length === 0}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Save Diagnostics
          </Button>
        )}

        {!isComplete && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention:</strong> Tous les diagnostics obligatoires doivent être fournis
              avant de pouvoir générer un contrat de location légal.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

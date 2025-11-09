import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Upload } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: "contract" | "invoice" | "certificate" | "other";
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Rental Agreement 2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadDate: "2024-01-01",
    category: "contract",
  },
  {
    id: "2",
    name: "January 2024 Invoice.pdf",
    type: "PDF",
    size: "156 KB",
    uploadDate: "2024-01-15",
    category: "invoice",
  },
  {
    id: "3",
    name: "Property Certificate.pdf",
    type: "PDF",
    size: "890 KB",
    uploadDate: "2023-12-15",
    category: "certificate",
  },
];

export const DocumentVault = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Vault
          </CardTitle>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{doc.size}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {doc.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

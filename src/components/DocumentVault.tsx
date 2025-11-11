import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIDocumentChat } from "@/components/AIDocumentChat";
import { FileText, Download, Eye, Upload, MessageSquare } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: "contract" | "invoice" | "certificate" | "other";
}

export const DocumentVault = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  return (
    <>
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
          {documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No documents uploaded yet</p>
          ) : (
            documents.map((doc) => (
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>

    <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {selectedDoc && (
          <>
            <DialogHeader>
              <DialogTitle>AI Document Analysis</DialogTitle>
            </DialogHeader>
            <AIDocumentChat
              documentName={selectedDoc.name}
              documentContext={`Document: ${selectedDoc.name}\nType: ${selectedDoc.category}\nDate: ${selectedDoc.uploadDate}\n\nThis is a ${selectedDoc.category} document. The assistant should help answer questions about typical content found in such documents.`}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

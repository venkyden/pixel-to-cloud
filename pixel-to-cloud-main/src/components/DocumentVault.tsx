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
    <Card className="glass-effect border-border/50 shadow-elegant overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document Vault
          </CardTitle>
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center glass-effect rounded-xl p-8 border border-border/50">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No documents uploaded yet</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 glass-effect border border-border/50 rounded-lg hover:shadow-elegant hover:scale-[1.02] transition-all duration-300 animate-fade-in"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center shadow-md ring-2 ring-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-medium">{doc.size}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
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
                    className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">
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

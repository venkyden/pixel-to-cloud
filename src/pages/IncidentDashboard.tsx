import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { IncidentStatsDisplay } from "@/components/incidents/IncidentStats";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { mockIncidents, mockIncidentStats } from "@/data/mockIncidents";
import { Incident } from "@/types/incidents";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download,
  Plus,
  FileText,
  Paperclip,
  Shield
} from "lucide-react";

const IncidentDashboard = () => {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || incident.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewDetails = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">Roomivo</h1>
              <Badge variant="outline" className="text-sm">
                <Shield className="w-3 h-3 mr-1" />
                Transparency Dashboard
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Incident Reporting Dashboard</h2>
              <p className="text-muted-foreground">
                Complete transparency for all rental incidents and their resolutions
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Incident
              </Button>
            </div>
          </div>

          <IncidentStatsDisplay stats={mockIncidentStats} />
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Incidents ({filteredIncidents.length})</TabsTrigger>
            <TabsTrigger value="open">
              Open ({filteredIncidents.filter(i => i.status === 'open').length})
            </TabsTrigger>
            <TabsTrigger value="investigating">
              Investigating ({filteredIncidents.filter(i => i.status === 'investigating').length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({filteredIncidents.filter(i => i.status === 'resolved').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIncidents
                .filter(i => i.status === 'open')
                .map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onViewDetails={handleViewDetails}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="investigating" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIncidents
                .filter(i => i.status === 'investigating')
                .map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onViewDetails={handleViewDetails}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIncidents
                .filter(i => i.status === 'resolved')
                .map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onViewDetails={handleViewDetails}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {selectedIncident.title}
                  <Badge variant="outline" className="text-xs ml-2">
                    {selectedIncident.id}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={
                    selectedIncident.status === 'resolved' ? 'bg-success/10 text-success border-success/20' :
                    selectedIncident.status === 'investigating' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-destructive/10 text-destructive border-destructive/20'
                  }>
                    Status: {selectedIncident.status}
                  </Badge>
                  <Badge className={
                    selectedIncident.priority === 'critical' ? 'bg-destructive' :
                    selectedIncident.priority === 'high' ? 'bg-warning/80 text-white' :
                    selectedIncident.priority === 'medium' ? 'bg-secondary' :
                    'bg-muted'
                  }>
                    Priority: {selectedIncident.priority}
                  </Badge>
                  <Badge variant="outline">
                    Category: {selectedIncident.category}
                  </Badge>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Incident Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Description:</p>
                      <p className="text-foreground">{selectedIncident.description}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-border">
                      <div>
                        <p className="text-muted-foreground mb-1">Property:</p>
                        <p className="font-medium text-foreground">{selectedIncident.propertyName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Reported by:</p>
                        <p className="font-medium text-foreground">
                          {selectedIncident.reporterName} ({selectedIncident.reportedBy})
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Created:</p>
                        <p className="font-medium text-foreground">
                          {new Date(selectedIncident.createdAt).toLocaleString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Last Updated:</p>
                        <p className="font-medium text-foreground">
                          {new Date(selectedIncident.updatedAt).toLocaleString('en-GB')}
                        </p>
                      </div>
                    </div>

                    {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-muted-foreground mb-2 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          Attachments:
                        </p>
                        <div className="flex gap-2">
                          {selectedIncident.attachments.map((file, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {file}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedIncident.resolution && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-muted-foreground mb-1">Resolution:</p>
                        <p className="text-success font-medium">{selectedIncident.resolution}</p>
                      </div>
                    )}
                  </div>
                </Card>

                <IncidentTimeline timeline={selectedIncident.timeline} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentDashboard;

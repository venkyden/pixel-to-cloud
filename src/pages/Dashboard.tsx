import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LandlordDashboard } from "@/components/LandlordDashboard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PaymentHistory } from "@/components/PaymentHistory";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { MaintenanceRequests } from "@/components/MaintenanceRequests";
import { DocumentVault } from "@/components/DocumentVault";
import { PropertyInspection } from "@/components/PropertyInspection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BarChart3, Receipt, Wrench, FileText, Video } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse floating" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Header />
      <main className="flex-1 container py-8 relative">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your properties and tenants</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 glass-effect p-1.5 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              <Receipt className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              <Wrench className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="inspections" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              <Video className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Inspections</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              <Receipt className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <LandlordDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentHistory />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceRequests />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentVault />
          </TabsContent>

          <TabsContent value="inspections">
            <PropertyInspection />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceGenerator />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

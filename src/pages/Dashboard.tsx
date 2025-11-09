import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PaymentHistory } from "@/components/PaymentHistory";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { MaintenanceRequests } from "@/components/MaintenanceRequests";
import { DocumentVault } from "@/components/DocumentVault";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Receipt, Wrench, FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and tenants</p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="payments">
              <Receipt className="mr-2 h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="mr-2 h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Receipt className="mr-2 h-4 w-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="invoices">
            <InvoiceGenerator />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

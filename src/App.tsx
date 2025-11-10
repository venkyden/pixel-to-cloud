import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { AIChatbot } from "@/components/AIChatbot";
import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";
import TenantFlow from "./pages/TenantFlow";
import LandlordFlow from "./pages/LandlordFlow";
import IncidentDashboard from "./pages/IncidentDashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Properties from "./pages/Properties";
import Dashboard from "./pages/Dashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
              <Route path="/tenant" element={<ProtectedRoute><TenantFlow /></ProtectedRoute>} />
              <Route path="/landlord" element={<ProtectedRoute><LandlordFlow /></ProtectedRoute>} />
              <Route path="/incidents" element={<ProtectedRoute><IncidentDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
            <AIChatbot />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

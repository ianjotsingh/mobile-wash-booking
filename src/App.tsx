
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import CompanySignup from "./pages/CompanySignup";
import CompanyDashboard from "./pages/CompanyDashboard";
import OrderHistory from "./pages/OrderHistory";
import MechanicRequest from "./pages/MechanicRequest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/company-signup" element={<CompanySignup />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/mechanic-request" element={<MechanicRequest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

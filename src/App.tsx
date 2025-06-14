
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import CompanySignup from "./pages/CompanySignup";
import MechanicSignup from "./pages/MechanicSignup";
import CompanyDashboard from "./pages/CompanyDashboard";
import OrderHistory from "./pages/OrderHistory";
import MechanicRequest from "./pages/MechanicRequest";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import MobileApp from "./components/MobileApp";

const queryClient = new QueryClient();

const App = () => {
  // Check if we're in mobile mode or on a mobile device
  const isMobileApp = window.location.search.includes('mobile=true') || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobileApp) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen w-full bg-white">
              <Toaster />
              <Sonner />
              <MobileApp />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen w-full bg-white">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/company-signup" element={<CompanySignup />} />
                <Route path="/mechanic-signup" element={<MechanicSignup />} />
                <Route path="/company-dashboard" element={<CompanyDashboard />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/mechanic-request" element={<MechanicRequest />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

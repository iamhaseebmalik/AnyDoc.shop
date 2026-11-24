import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Editor from "./pages/Editor";
import Auth from "./pages/Auth";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import { MobileTabBar } from "@/components/MobileTabBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="mobile-tab-content">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
        <MobileTabBar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

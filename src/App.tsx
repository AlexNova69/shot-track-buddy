import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import History from "./pages/History";
import Charts from "./pages/Charts";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { MobileLayout } from "@/components/MobileLayout";
import { useTheme } from "@/hooks/useTheme";

const queryClient = new QueryClient();

function AppContent() {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Apply theme class to document
    document.documentElement.className = theme === "system" 
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;
  }, [theme]);

  return (
    <BrowserRouter>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MobileLayout>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

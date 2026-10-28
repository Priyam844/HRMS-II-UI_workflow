import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/requisitions" element={<Index />} />
          <Route path="/approvals" element={<Index />} />
          <Route path="/postings" element={<Index />} />
          <Route path="/applications" element={<Index />} />
          <Route path="/cv-processing" element={<Index />} />
          <Route path="/matching" element={<Index />} />
          <Route path="/shortlisting" element={<Index />} />
          <Route path="/interviews" element={<Index />} />
          <Route path="/offers" element={<Index />} />
          <Route path="/joining" element={<Index />} />
          <Route path="/employees" element={<Index />} />
          <Route path="/analytics" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

declare global {
  interface Window {
    __tandemRoot?: ReturnType<typeof createRoot>;
  }
}

const root = window.__tandemRoot ?? (window.__tandemRoot = createRoot(document.getElementById("root")!));
root.render(<App />);

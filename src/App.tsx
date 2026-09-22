import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Home from "./pages/Home";
import SQLPage from "./pages/SQLPage";
import SQLDialectPage from "./pages/SQLDialectPage";
import JSONPage from "./pages/JSONPage";
import XMLPage from "./pages/XMLPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import { ThemeProvider } from "@/components/theme-provider";
import { CookieBanner } from "@/components/CookieBanner";
import { SEO } from "@/components/SEO";

const queryClient = new QueryClient();

/**
 * Everything below the router. Kept separate from the router itself so the build-time
 * prerender (src/entry-server.tsx) can wrap it in a StaticRouter while the browser
 * entry (src/main.tsx) wraps it in a BrowserRouter.
 */
export const AppRoutes = () => (
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        {/* One instance for the whole app: the route is the only input it needs. */}
        <SEO />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sql" element={<SQLPage />} />
          <Route path="/sql/:dialect" element={<SQLDialectPage />} />
          <Route path="/json" element={<JSONPage />} />
          <Route path="/xml" element={<XMLPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default AppRoutes;

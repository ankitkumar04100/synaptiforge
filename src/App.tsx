import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/store/useAppStore";
import { hydrateStore } from "@/db/hydrate";
import { Navbar } from "@/components/Navbar";
import { useEffect } from "react";
import { lazy, Suspense } from "react";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EditorPage = lazy(() => import("./pages/EditorPage"));
const SignaturePage = lazy(() => import("./pages/SignaturePage"));
const ReflexesPage = lazy(() => import("./pages/ReflexesPage"));
const PatchesPage = lazy(() => import("./pages/PatchesPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, hydrated, setSseConnected } = useAppStore();

  useEffect(() => {
    hydrateStore();
  }, []);

  // Simulate SSE connection
  useEffect(() => {
    if (!isAuthenticated) return;
    setSseConnected(true);
    const interval = setInterval(() => setSseConnected(true), 15000);
    return () => { clearInterval(interval); setSseConnected(false); };
  }, [isAuthenticated, setSseConnected]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-muted-foreground text-sm animate-pulse-soft">Loading Synaptiforge...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">Loading...</div>}>
        <Routes>
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" />} />
          <Route path="/editor" element={isAuthenticated ? <EditorPage /> : <Navigate to="/auth" />} />
          <Route path="/signature" element={isAuthenticated ? <SignaturePage /> : <Navigate to="/auth" />} />
          <Route path="/reflexes" element={isAuthenticated ? <ReflexesPage /> : <Navigate to="/auth" />} />
          <Route path="/patches" element={isAuthenticated ? <PatchesPage /> : <Navigate to="/auth" />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/auth" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import React, { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RoleProvider, useRole } from "./contexts/RoleContext";

// Create Auth Context
const AuthContext = createContext<{ user: any; session: any }>({ user: null, session: null });

// Export the useAuth hook so we can use it in other components
export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fix the subscription access
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => {
      // Call unsubscribe() on the data object
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session }}>
      <RoleProvider>{children}</RoleProvider>
    </AuthContext.Provider>
  );
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const RequireAccess = ({ children }: { children: React.ReactNode }) => {
  const { userRole, loading } = useRole();
  const location = useLocation();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading access...</div>;
  }
  
  if (userRole === "blocked") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 shadow-xl rounded-2xl px-7 py-8 w-full max-w-md border border-[#e8e8fc] text-center">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            Your account is currently blocked. Please contact an administrator for assistance.
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <RequireAccess>
                    <Index />
                  </RequireAccess>
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <RequireAccess>
                    <Dashboard />
                  </RequireAccess>
                </RequireAuth>
              }
            />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

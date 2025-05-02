
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

type AuthMode = "signin" | "signup";

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, loading: roleLoading } = useRole();
  
  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || "/";

  // Subscribe to auth changes
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // We'll handle the navigation in the next useEffect
        setSession(session);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle navigation based on role once we have both session and role
  useEffect(() => {
    if (session?.user && !roleLoading) {
      if (userRole === "blocked") {
        // For blocked users, we'll still redirect to '/' where they'll see a message
        navigate("/");
      } else {
        // For admin and regular users, redirect to the intended destination
        navigate(from);
      }
    }
  }, [session, userRole, roleLoading, navigate, from]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        toast({ title: "Sign in failed", description: error.message });
      } else {
        toast({ title: "Signed in!", description: "Welcome back." });
        // Redirect will happen by auth listener
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/auth" }
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        toast({ title: "Sign up failed", description: error.message });
      } else {
        toast({
          title: "Account created!",
          description: "By default, new accounts are blocked. Please contact an admin to activate your account."
        });
        setMode("signin");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#d3e4fd] via-[#f1f0fb] to-white px-2">
      <div className="bg-white/90 shadow-xl rounded-2xl px-7 py-8 w-full max-w-xs flex flex-col gap-3 border border-[#e8e8fc] backdrop-blur-md">
        <h2 className="text-2xl font-extrabold text-[#1A1F2C] mb-2">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>
        {mode === "signup" && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3 text-xs text-blue-800">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
              <div>
                <p className="font-semibold">Note:</p>
                <p>New accounts are blocked by default. Contact an admin to activate your account after signing up.</p>
              </div>
            </div>
          </div>
        )}
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {mode === "signup" && (
            <div>
              <Input
                name="confirm"
                type="password"
                placeholder="Confirm Password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
          {error && (
            <span className="text-xs text-destructive font-medium">{error}</span>
          )}
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
            {loading
              ? mode === "signup"
                ? "Creating..."
                : "Signing in..."
              : mode === "signup"
                ? "Create Account"
                : "Sign In"}
          </Button>
        </form>
        <div className="text-center text-sm mt-2">
          {mode === "signin" ? (
            <>
              Need an account?{" "}
              <button
                className="text-primary underline"
                onClick={() => { setMode("signup"); setError(null); }}
                disabled={loading}
                type="button"
              >Sign up</button>
            </>
          ) : (
            <>
              Already a user?{" "}
              <button
                className="text-primary underline"
                onClick={() => { setMode("signin"); setError(null); }}
                disabled={loading}
                type="button"
              >Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

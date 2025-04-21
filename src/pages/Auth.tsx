
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signin" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Subscribe to auth changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        navigate("/");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        navigate("/");
      }
    });
    return () => {
      listener?.unsubscribe();
    };
  }, [navigate]);

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
          description: "Check your email to confirm your account."
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

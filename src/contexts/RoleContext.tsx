
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../App";
import { toast } from "@/hooks/use-toast";

export type UserRole = "admin" | "user" | "blocked";

interface RoleContextType {
  userRole: UserRole | null;
  isAdmin: boolean;
  isUser: boolean;
  isBlocked: boolean;
  refetchRole: () => Promise<void>;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  userRole: null,
  isAdmin: false,
  isUser: false,
  isBlocked: false,
  refetchRole: async () => {},
  loading: true,
});

export const useRole = () => useContext(RoleContext);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        toast({
          title: "Error fetching user role",
          description: error.message,
          variant: "destructive",
        });
        setUserRole(null);
      } else {
        setUserRole(data.role as UserRole);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected error",
        description: error.message,
        variant: "destructive",
      });
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  const value = {
    userRole,
    isAdmin: userRole === "admin",
    isUser: userRole === "user",
    isBlocked: userRole === "blocked",
    refetchRole: fetchUserRole,
    loading,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

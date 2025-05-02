
import React from "react";
import { useRole, UserRole } from "@/contexts/RoleContext";

interface PermissionGuardProps {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  allowedRoles, 
  fallback = null, 
  children 
}) => {
  const { userRole, loading } = useRole();

  if (loading) {
    return <div className="p-4">Loading permissions...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;

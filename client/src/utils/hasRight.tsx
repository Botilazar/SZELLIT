import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import React from "react";
import { toast } from "react-hot-toast";
import LoadingAnimation from "../Components/LoadingAnimation/LoadingAnimation";

// Generic HOC that enforces auth/roles
export default function hasRight<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string // undefined = just logged in, string = required role
) {
  const Wrapped: React.FC<P> = (props) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <LoadingAnimation />;
    }

    if (!user) {
      return <Navigate to="/en/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
      toast.error("You have no permission to visit this site.");
      return <Navigate to="/en" replace />;
    }

    return <Component {...props} />;
  };

  // Set a helpful display name for React DevTools
  Wrapped.displayName = `hasRight(${Component.displayName || Component.name || "Component"})`;

  return Wrapped;
}

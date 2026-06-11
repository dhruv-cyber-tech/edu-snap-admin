import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { session } = useAuth();

  return session ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
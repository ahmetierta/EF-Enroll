import { Navigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const authUser = getAuthUser();

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(authUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

import { Navigate, useLocation } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const authUser = getAuthUser();
  const location = useLocation();

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(authUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

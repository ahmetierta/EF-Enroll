import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { clearAuth, getAuthUser, saveAuth } from "../utils/authStorage";
import { getRoleHomePath } from "./roleRedirects";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [authUser, setAuthUser] = useState(() => getAuthUser());
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    authService
      .me()
      .then((res) => {
        if (!isMounted) {
          return;
        }

        saveAuth(res.data.user);
        setAuthUser(res.data.user);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        clearAuth();
        setAuthUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingSession) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(authUser.role)) {
    return <Navigate to={getRoleHomePath(authUser.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;

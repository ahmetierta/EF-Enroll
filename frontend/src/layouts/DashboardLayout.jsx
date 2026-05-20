import { Navigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";
import AdminLayout from "./admin/AdminLayout";
import ProfessorLayout from "./professor/ProfessorLayout";
import UserLayout from "./user/UserLayout";

const DashboardLayout = () => {
  const authUser = getAuthUser();

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (authUser.role === "admin") {
    return <AdminLayout />;
  }

  if (authUser.role === "professor") {
    return <ProfessorLayout />;
  }

  if (authUser.role === "student") {
    return <UserLayout />;
  }

  return <Navigate to="/" replace />;
};

export default DashboardLayout;

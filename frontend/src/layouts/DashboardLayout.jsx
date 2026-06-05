import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";
import AdminLayout from "./admin/AdminLayout";
import ProfessorLayout from "./professor/ProfessorLayout";
import UserLayout from "./user/UserLayout";

const DashboardLayout = () => {
  const authUser = getAuthUser();

  if (!authUser) {
    return <Outlet />;
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

  return <Outlet />;
};

export default DashboardLayout;

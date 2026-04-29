import { Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AdminApprovals from "../pages/admin/AdminApprovals";
import Courses from "../pages/Courses";
import Departments from "../pages/Departments";
import PlaceholderPage from "../pages/PlaceholderPage";
import Professors from "../pages/Professors";
import PublicCourses from "../pages/PublicCourses";
import Schedules from "../pages/Schedules";
import Semesters from "../pages/Semesters";
import Students from "../pages/Students";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RegisterProfessor from "../pages/auth/RegisterProfessor";
import RegisterStudent from "../pages/auth/RegisterStudent";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicCourses />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/student" element={<RegisterStudent />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />

      <Route path="/" element={<AppLayout />}>
        <Route
          path="admin/approvals"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor"]}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="professors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Professors />
            </ProtectedRoute>
          }
        />
        <Route
          path="semesters"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Semesters />
            </ProtectedRoute>
          }
        />
        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor"]}>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="schedules"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor"]}>
              <Schedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="enrollments"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor"]}>
              <PlaceholderPage title="Enrollments" />
            </ProtectedRoute>
          }
        />
        <Route
          path="waiting-list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PlaceholderPage title="Waiting List" />
            </ProtectedRoute>
          }
        />
        <Route
          path="announcements"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor"]}>
              <PlaceholderPage title="Announcements" />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminApprovals from "../pages/admin/AdminApprovals";
import Announcements from "../pages/Announcements";
import Courses from "../pages/Courses";
import Departments from "../pages/Departments";
import Enrollments from "../pages/Enrollments";
import Materials from "../pages/Materials";
import MyEnrollments from "../pages/MyEnrollments";
import Payments from "../pages/Payments";
import Professors from "../pages/Professors";
import PublicCourses from "../pages/PublicCourses";
import Revenue from "../pages/Revenue";
import Schedules from "../pages/Schedules";
import Semesters from "../pages/Semesters";
import Students from "../pages/Students";
import WaitingList from "../pages/WaitingList";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RegisterProfessor from "../pages/auth/RegisterProfessor";
import RegisterStudent from "../pages/auth/RegisterStudent";
import ResetPassword from "../pages/auth/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicCourses />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/student" element={<RegisterStudent />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />

      <Route path="/" element={<DashboardLayout />}>
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
              <Enrollments />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="revenue"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Revenue />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-enrollments"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyEnrollments />
            </ProtectedRoute>
          }
        />
        <Route
          path="waiting-list"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor", "student"]}>
              <WaitingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="announcements"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor", "student"]}>
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route
          path="materials"
          element={
            <ProtectedRoute allowedRoles={["admin", "professor", "student"]}>
              <Materials />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

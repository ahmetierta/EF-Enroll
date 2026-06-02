import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Announcements from "../pages/Announcements";
import CourseDetails from "../pages/CourseDetails";
import Departments from "../pages/Departments";
import Enrollments from "../pages/Enrollments";
import Home from "../pages/Home";
import MyEnrollments from "../pages/MyEnrollments";
import NotFound from "../pages/NotFound";
import PublicCourses from "../pages/PublicCourses";
import Schedules from "../pages/Schedules";
import Semesters from "../pages/Semesters";
import WaitingList from "../pages/WaitingList";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RegisterProfessor from "../pages/auth/RegisterProfessor";
import RegisterStudent from "../pages/auth/RegisterStudent";
import ResetPassword from "../pages/auth/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminApprovals = lazy(() => import("../pages/admin/AdminApprovals"));
const Courses = lazy(() => import("../pages/Courses"));
const Materials = lazy(() => import("../pages/Materials"));
const Payments = lazy(() => import("../pages/Payments"));
const ProfessorDashboard = lazy(() => import("../pages/professor/ProfessorDashboard"));
const Professors = lazy(() => import("../pages/Professors"));
const Revenue = lazy(() => import("../pages/Revenue"));
const Students = lazy(() => import("../pages/Students"));
const StudentDashboard = lazy(() => import("../pages/student/StudentDashboard"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-6 text-slate-600">Loading...</div>}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<PublicCourses />} />
      <Route path="/catalog/:id" element={<CourseDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/student" element={<RegisterStudent />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />

      <Route path="/" element={<DashboardLayout />}>
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/approvals"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="professor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["professor"]}>
              <ProfessorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
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

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;

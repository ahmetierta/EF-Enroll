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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicCourses />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/student" element={<RegisterStudent />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />

      <Route path="/" element={<AppLayout />}>
        <Route path="admin/approvals" element={<AdminApprovals />} />
        <Route path="students" element={<Students />} />
        <Route path="professors" element={<Professors />} />
        <Route path="semesters" element={<Semesters />} />
        <Route path="departments" element={<Departments />} />
        <Route path="courses" element={<Courses />} />
        <Route path="schedules" element={<Schedules />} />
        <Route
          path="enrollments"
          element={<PlaceholderPage title="Enrollments" />}
        />
        <Route
          path="waiting-list"
          element={<PlaceholderPage title="Waiting List" />}
        />
        <Route
          path="announcements"
          element={<PlaceholderPage title="Announcements" />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Courses from "../pages/Courses";
import Departments from "../pages/Departments";
import PlaceholderPage from "../pages/PlaceholderPage";
import Professors from "../pages/Professors";
import Schedules from "../pages/Schedules";
import Semesters from "../pages/Semesters";
import Students from "../pages/Students";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/courses" replace />} />
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

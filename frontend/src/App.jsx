import {
  BrowserRouter as Router,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import Students from "./pages/Students";
import Professors from "./pages/Professors";
import Semesters from "./pages/Semesters";
import Departments from "./pages/Departments";
import Courses from "./pages/Courses";
import Schedules from "./pages/Schedules";

const navItems = [
  { to: "/courses", label: "Courses" },
  { to: "/students", label: "Students" },
  { to: "/professors", label: "Professors" },
  { to: "/semesters", label: "Semesters" },
  { to: "/departments", label: "Departments" },
  { to: "/schedules", label: "Schedules" },
  { to: "/enrollments", label: "Enrollments" },
  { to: "/waiting-list", label: "Waiting List" },
  { to: "/announcements", label: "Announcements" },
];

function PlaceholderPage({ title }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="rounded-3xl border border-slate-300 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-slate-600">
          This page is ready in the navbar and can be connected once we build
          its CRUD frontend.
        </p>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-300">
      <header className="sticky top-0 z-50 border-b border-slate-300/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              EF Enroll
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Student Course Registration Platform
            </h1>
          </div>

          <nav className="flex flex-wrap gap-5 border-b border-slate-200 pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-700 hover:text-blue-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;

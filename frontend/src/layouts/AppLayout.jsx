import { Outlet } from "react-router-dom";
import MainNavbar from "../components/navigation/MainNavbar";

const AppLayout = ({
  navRoles,
  sectionLabel = "EF Enroll",
  subtitle = "Student Course Registration Platform",
  title = "Dashboard",
}) => {
  return (
    <div className="min-h-screen bg-slate-300">
      <header className="sticky top-0 z-50 border-b border-slate-300/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              {sectionLabel}
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>

          <MainNavbar navRoles={navRoles} />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

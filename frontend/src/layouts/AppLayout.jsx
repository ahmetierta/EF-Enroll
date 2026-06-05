import { Outlet } from "react-router-dom";
import MainNavbar from "../components/navigation/MainNavbar";

const AppLayout = ({
  navRoles,
  sectionLabel = "EF Enroll",
  subtitle = "Student Course Registration Platform",
  title = "Dashboard",
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white lg:hidden">
        <div className="px-4 py-4">
          <p className="text-xs font-semibold uppercase text-blue-700">
            {sectionLabel}
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <MainNavbar navRoles={navRoles} />
      </header>

      <div className="lg:grid lg:min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-xs font-semibold uppercase text-blue-700">
              {sectionLabel}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
          <MainNavbar navRoles={navRoles} variant="sidebar" />
        </aside>

        <main className="min-w-0">
        <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

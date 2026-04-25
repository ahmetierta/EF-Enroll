import { Outlet } from "react-router-dom";
import MainNavbar from "../components/navigation/MainNavbar";

const AppLayout = () => {
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

          <MainNavbar />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

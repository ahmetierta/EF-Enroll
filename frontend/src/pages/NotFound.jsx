import { Link } from "react-router-dom";
import { getRoleHomePath } from "../routes/roleRedirects";
import { getAuthUser } from "../utils/authStorage";

const NotFound = () => {
  const authUser = getAuthUser();
  const dashboardPath = getRoleHomePath(authUser?.role);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f3f5] px-4 text-slate-900">
      <section className="w-full max-w-xl border border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          Page not found
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">404</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The page you are looking for does not exist or you do not have access
          to it.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Home
          </Link>
          <Link
            to="/catalog"
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Catalog
          </Link>
          {authUser && (
            <Link
              to={dashboardPath}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>
          )}
        </div>
      </section>
    </main>
  );
};

export default NotFound;

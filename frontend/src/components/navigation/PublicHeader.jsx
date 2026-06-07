import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { getRoleHomePath } from "../../routes/roleRedirects";
import { getAuthUser } from "../../utils/authStorage";

const PublicHeader = ({ activePage }) => {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const userInitial = authUser?.username?.charAt(0)?.toUpperCase() || "U";

  const linkClass = (isActive) =>
    `rounded border px-3 py-2 font-semibold transition ${
      isActive
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
    }`;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local logout still clears the client state if the server is unreachable.
    }

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <Link to="/" className="text-xl font-bold text-slate-950">
          EF Enroll
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className={linkClass(activePage === "home")}>
            Home
          </Link>
          <Link to="/catalog" className={linkClass(activePage === "catalog")}>
            Catalog
          </Link>
          {authUser?.role === "student" && (
            <Link to="/my-enrollments" className={linkClass(false)}>
              My courses
            </Link>
          )}
          {authUser && authUser.role !== "student" && (
            <Link to={getRoleHomePath(authUser.role)} className={linkClass(false)}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {authUser ? (
            <>
              <div className="flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-2 py-1">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-sm font-bold text-white">
                  {userInitial}
                </div>
                <div className="text-xs leading-tight">
                  <p className="font-semibold text-slate-900">
                    {authUser.username}
                  </p>
                  <p className="capitalize text-slate-500">{authUser.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;

import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { navItems } from "../../routes/navigation";
import { getAuthUser } from "../../utils/authStorage";

const MainNavbar = ({ navRoles, variant = "top" }) => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const { logout } = useContext(AuthContext);
  const userInitial = authUser?.username?.charAt(0)?.toUpperCase() || "U";
  const activeRoles = navRoles?.length ? navRoles : [authUser?.role];
  const visibleItems = navItems.filter((item) =>
    item.roles.some((role) => activeRoles.includes(role))
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local logout still clears the client state if the server is unreachable.
    }

    navigate("/login");
  };

  if (variant === "sidebar") {
    return (
      <div className="flex flex-1 flex-col justify-between px-4 py-5">
        <nav className="grid gap-1">
          {visibleItems.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {authUser && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
                {userInitial}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate font-semibold text-slate-950">
                  {authUser.username || authUser.email}
                </p>
                <p className="capitalize text-slate-500">{authUser.role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {visibleItems.map((item) => (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {authUser && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
              {userInitial}
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-slate-900">
                {authUser.username || authUser.email}
              </p>
              <p className="capitalize text-slate-500">{authUser.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default MainNavbar;

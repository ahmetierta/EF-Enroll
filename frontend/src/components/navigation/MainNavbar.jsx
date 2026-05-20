import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { navItems } from "../../routes/navigation";
import { getAuthUser } from "../../utils/authStorage";

const MainNavbar = ({ navRoles }) => {
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

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-1 lg:flex-row lg:items-center lg:justify-between">
      <nav className="flex flex-wrap gap-5">
        {visibleItems.map((item) => (
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

      {authUser && (
        <div className="flex flex-wrap items-center gap-3 pb-3 text-sm">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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

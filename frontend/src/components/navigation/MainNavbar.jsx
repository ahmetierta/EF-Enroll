import { NavLink, useNavigate } from "react-router-dom";
import { navItems } from "../../routes/navigation";
import { clearAuth, getAuthUser } from "../../utils/authStorage";

const MainNavbar = () => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const visibleItems = navItems.filter((item) =>
    item.roles.includes(authUser?.role)
  );

  const handleLogout = () => {
    clearAuth();
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
          <span className="text-slate-600">
            {authUser.email} - {authUser.role}
          </span>
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

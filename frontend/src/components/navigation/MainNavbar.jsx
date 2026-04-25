import { NavLink } from "react-router-dom";
import { navItems } from "../../routes/navigation";

const MainNavbar = () => {
  return (
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
  );
};

export default MainNavbar;

import { Link } from "react-router-dom";

const AuthShell = ({ children, subtitle, title }) => {
  return (
    <div className="min-h-screen bg-slate-300 px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_1.2fr]">
          <div className="bg-slate-900 p-8 text-white">
            <Link
              to="/"
              className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200"
            >
              EF Enroll
            </Link>
            <h1 className="mt-8 text-3xl font-bold">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">{subtitle}</p>
          </div>

          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;

import { Link } from "react-router-dom";
import AuthShell from "./AuthShell";

const Register = () => {
  return (
    <AuthShell
      title="Sign up"
      subtitle="Choose the account type that matches how you will use EF Enroll."
    >
      <div className="grid gap-4">
        <Link
          to="/register/student"
          className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Register as Student
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Create a student account and use it to enroll in courses.
          </p>
        </Link>

        <Link
          to="/register/professor"
          className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Register as Professor
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Create a professor account. An admin must approve it before login.
          </p>
        </Link>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-blue-700">
          Login
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;

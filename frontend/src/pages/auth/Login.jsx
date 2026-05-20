import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import AuthContext from "../../context/AuthContext";
import AuthShell from "./AuthShell";

const roleRedirects = {
  admin: "/admin/approvals",
  professor: "/courses",
  student: "/",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      const user = data.user;

      navigate(roleRedirects[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Login"
      subtitle="Use one account to access EF Enroll. Your role is checked automatically after login."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>
          <TextInput
            autoComplete="on"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <div className="relative">
            <TextInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center">
        <p className="text-sm text-slate-600">
          Do not have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-700">
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;

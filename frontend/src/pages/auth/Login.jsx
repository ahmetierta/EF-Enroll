import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import { authService } from "../../services/authService";
import { saveAuth } from "../../utils/authStorage";
import AuthShell from "./AuthShell";

const initialFormData = {
  email: "",
  password: "",
};

const roleRedirects = {
  admin: "/admin/approvals",
  professor: "/courses",
  student: "/",
};

const Login = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    authService
      .login(formData)
      .then((res) => {
        saveAuth(res.data.token, res.data.user);
        navigate(roleRedirects[res.data.user.role] || "/courses");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Login failed.");
      });
  };

  return (
    <AuthShell
      title="Login"
      subtitle="Use one account to access EF Enroll. Your role is checked automatically after login."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <TextInput
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <TextInput
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth>
          Login
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Do not have an account?{" "}
        <Link to="/register" className="font-semibold text-blue-700">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;

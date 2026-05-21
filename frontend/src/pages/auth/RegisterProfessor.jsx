import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import SelectInput from "../../components/ui/SelectInput";
import TextInput from "../../components/ui/TextInput";
import AuthContext from "../../context/AuthContext";
import { departmentService } from "../../services/departmentService";
import {
  professorRegisterSchema,
  validateForm,
} from "../../validation/schemas";
import AuthShell from "./AuthShell";

const RegisterProfessor = () => {
  const [departments, setDepartments] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [titulli, setTitulli] = useState("");
  const [departamenti, setDepartamenti] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerProfessor } = useContext(AuthContext);

  function fetchDepartments() {
    departmentService
      .getAll()
      .then((res) => setDepartments(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      titulli,
      departamenti,
    };
    const validationError = await validateForm(professorRegisterSchema, payload);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await registerProfessor(payload);
      alert("Professor account created. It is pending admin approval.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Error occurred while registering.");
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Professor Sign Up"
      subtitle="Create your professor account. You can log in after admin approval."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Username
          </label>
          <TextInput
            autoComplete="on"
            id="username"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

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
              placeholder="Enter your password"
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

        <div>
          <label
            htmlFor="titulli"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Title
          </label>
          <TextInput
            id="titulli"
            placeholder="Title (Dr., Prof.)"
            value={titulli}
            onChange={(e) => setTitulli(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="departamenti"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Department
          </label>
          <SelectInput
            id="departamenti"
            value={departamenti}
            onChange={(e) => setDepartamenti(e.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.emertimi}>
                {department.emertimi}
              </option>
            ))}
          </SelectInput>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Creating account..." : "Register Professor"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Back to{" "}
        <Link to="/register" className="font-semibold text-blue-700">
          sign up options
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterProfessor;

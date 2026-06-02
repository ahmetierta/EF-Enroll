import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import SelectInput from "../../components/ui/SelectInput";
import TextInput from "../../components/ui/TextInput";
import AuthContext from "../../context/AuthContext";
import {
  studentRegisterSchema,
  validateForm,
} from "../../validation/schemas";
import AuthShell from "./AuthShell";

const programs = [
  "Computer Science",
  "Software Engineering",
  "Information Systems",
  "Business Administration",
  "Data Science",
  "Cybersecurity",
];

const studyYears = [
  { value: "1", label: "Year 1" },
  { value: "2", label: "Year 2" },
  { value: "3", label: "Year 3" },
  { value: "4", label: "Year 4" },
];

const RegisterStudent = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programi, setProgrami] = useState("");
  const [vitiStudimit, setVitiStudimit] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerStudent } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      programi,
      viti_studimit: vitiStudimit,
    };
    const validationError = await validateForm(studentRegisterSchema, payload);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await registerStudent(payload);
      navigate("/login", {
        state: { message: "Student account created successfully. You can log in now." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error occurred while registering.");
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Student Sign Up"
      subtitle="Create your student account before enrolling in courses."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full name
          </label>
          <TextInput
            autoComplete="name"
            id="username"
            placeholder="e.g. Arta Krasniqi"
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
            autoComplete="email"
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
            htmlFor="programi"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Program
          </label>
          <SelectInput
            id="programi"
            value={programi}
            onChange={(e) => setProgrami(e.target.value)}
          >
            <option value="">Select Program</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </SelectInput>
        </div>

        <div>
          <label
            htmlFor="vitiStudimit"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Year of Study
          </label>
          <SelectInput
            id="vitiStudimit"
            value={vitiStudimit}
            onChange={(e) => setVitiStudimit(e.target.value)}
          >
            <option value="">Select Year of Study</option>
            {studyYears.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
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
          {loading ? "Creating account..." : "Register Student"}
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

export default RegisterStudent;

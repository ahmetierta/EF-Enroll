import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import { authService } from "../../services/authService";
import AuthShell from "./AuthShell";

const initialFormData = {
  username: "",
  email: "",
  password: "",
  numri_studentit: "",
  programi: "",
  viti_studimit: "",
};

const RegisterStudent = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    authService
      .registerStudent(formData)
      .then(() => {
        alert("Student account created successfully. You can log in now.");
        navigate("/login");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Sign up failed.");
      });
  };

  return (
    <AuthShell
      title="Student Sign Up"
      subtitle="Create your student account before enrolling in courses."
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <TextInput
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
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
        <TextInput
          name="numri_studentit"
          placeholder="Student Number"
          value={formData.numri_studentit}
          onChange={handleChange}
        />
        <TextInput
          name="programi"
          placeholder="Program"
          value={formData.programi}
          onChange={handleChange}
        />
        <TextInput
          type="number"
          name="viti_studimit"
          placeholder="Year"
          value={formData.viti_studimit}
          onChange={handleChange}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth>
          Register Student
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

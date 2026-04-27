import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import SelectInput from "../../components/ui/SelectInput";
import TextInput from "../../components/ui/TextInput";
import { authService } from "../../services/authService";
import { departmentService } from "../../services/departmentService";
import AuthShell from "./AuthShell";

const initialFormData = {
  username: "",
  email: "",
  password: "",
  titulli: "",
  departamenti: "",
};

const RegisterProfessor = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function fetchDepartments() {
    departmentService
      .getAll()
      .then((res) => setDepartments(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

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
      .registerProfessor(formData)
      .then(() => {
        alert("Professor account created. It is pending admin approval.");
        navigate("/login");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Sign up failed.");
      });
  };

  return (
    <AuthShell
      title="Professor Sign Up"
      subtitle="Create your professor account. You can log in after admin approval."
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
          name="titulli"
          placeholder="Title (Dr., Prof.)"
          value={formData.titulli}
          onChange={handleChange}
        />
        <SelectInput
          name="departamenti"
          value={formData.departamenti}
          onChange={handleChange}
        >
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.emertimi}>
              {department.emertimi}
            </option>
          ))}
        </SelectInput>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth>
          Register Professor
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

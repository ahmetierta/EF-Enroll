import React, { useEffect, useState } from "react";
import axios from "axios";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";

const initialFormData = {
  username: "",
  email: "",
  password_hash: "",
  titulli: "",
  departamenti: "",
};

const Professors = () => {
  const [professors, setProfessors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);

  function fetchProfessors() {
    axios
      .get("http://localhost:5000/professors")
      .then((res) => setProfessors(res.data))
      .catch((err) => console.log(err));
  }

  function fetchDepartments() {
    axios
      .get("http://localhost:5000/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchProfessors();
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditId(null);
  };

  const addProfessor = () => {
    axios
      .post("http://localhost:5000/professors", formData)
      .then(() => {
        fetchProfessors();
        resetForm();
        alert("Professor added successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to add professor.");
      });
  };

  const updateProfessor = () => {
    axios
      .put(`http://localhost:5000/professors/${editId}`, formData)
      .then(() => {
        fetchProfessors();
        resetForm();
        alert("Professor updated successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to update professor.");
      });
  };

  const deleteProfessor = (id) => {
    if (!window.confirm("Do you want to delete this professor?")) return;

    axios
      .delete(`http://localhost:5000/professors/${id}`)
      .then(() => {
        fetchProfessors();
        if (editId === id) resetForm();
        alert("Professor deleted successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to delete professor.");
      });
  };

  const editProfessor = (professor) => {
    setEditId(professor.id);
    setFormData({
      username: professor.username || "",
      email: professor.email || "",
      password_hash: "",
      titulli: professor.titulli || "",
      departamenti: professor.departamenti || "",
    });
  };

  return (
    <PageContainer title="Professors Management">
      <div className="grid gap-8 lg:grid-cols-3">
        <FormCard title={editId ? "Edit Professor" : "Add Professor"}>
          <div className="space-y-4">
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
              name="password_hash"
              placeholder="Password"
              value={formData.password_hash}
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
          </div>

          <div className="mt-6 flex gap-3">
            {editId ? (
              <>
                <Button onClick={updateProfessor} className="flex-1">
                  Update
                </Button>

                <Button
                  onClick={resetForm}
                  className="flex-1"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={addProfessor} fullWidth>
                Add Professor
              </Button>
            )}
          </div>
        </FormCard>

        <TableCard title="Professors List">
          <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-700">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {professors.length > 0 ? (
                  professors.map((professor) => (
                    <tr
                      key={professor.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">{professor.id}</td>
                      <td className="px-4 py-3">{professor.username}</td>
                      <td className="px-4 py-3">{professor.email}</td>
                      <td className="px-4 py-3">{professor.titulli}</td>
                      <td className="px-4 py-3">{professor.departamenti}</td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => editProfessor(professor)}
                            className="px-3 py-2"
                            variant="ghost"
                          >
                            Edit
                          </Button>

                          <Button
                            onClick={() => deleteProfessor(professor.id)}
                            className="px-3 py-2"
                            variant="danger"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan="6">
                      No professors found.
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
        </TableCard>
      </div>
    </PageContainer>
  );
};

export default Professors;

import React, { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    fetchProfessors();
    fetchDepartments();
  }, []);

  const fetchProfessors = () => {
    axios
      .get("http://localhost:5000/professors")
      .then((res) => setProfessors(res.data))
      .catch((err) => console.log(err));
  };

  const fetchDepartments = () => {
    axios
      .get("http://localhost:5000/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.log(err));
  };

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
    <div className="min-h-screen bg-slate-300 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-700">
          Professors Management
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">
              {editId ? "Edit Professor" : "Add Professor"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="password_hash"
                placeholder="Password"
                value={formData.password_hash}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="titulli"
                placeholder="Title (Dr., Prof.)"
                value={formData.titulli}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />

              <select
                name="departamenti"
                value={formData.departamenti}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.emertimi}>
                    {department.emertimi}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <button
                    onClick={updateProfessor}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    onClick={resetForm}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={addProfessor}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                >
                  Add Professor
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold">Professors List</h2>

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
                          <button
                            onClick={() => editProfessor(professor)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteProfessor(professor.id)}
                            className="rounded-lg bg-red-500 px-3 py-2 text-white"
                          >
                            Delete
                          </button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Professors;

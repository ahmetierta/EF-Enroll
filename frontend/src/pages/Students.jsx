import React, { useEffect, useState } from "react";
import axios from "axios";

const initialFormData = {
  username: "",
  email: "",
  password_hash: "",
  numri_studentit: "",
  programi: "",
  viti_studimit: "",
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    axios
      .get("http://localhost:5000/students")
      .then((res) => setStudents(res.data))
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

  const addStudent = () => {
    axios
      .post("http://localhost:5000/students", formData)
      .then(() => {
        fetchStudents();
        resetForm();
        alert("Student added successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to add student.");
      });
  };

  const updateStudent = () => {
    axios
      .put(`http://localhost:5000/students/${editId}`, formData)
      .then(() => {
        fetchStudents();
        resetForm();
        alert("Student updated successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to update student.");
      });
  };

  const deleteStudent = (id) => {
    if (!window.confirm("Do you want to delete this student?")) return;

    axios
      .delete(`http://localhost:5000/students/${id}`)
      .then(() => {
        fetchStudents();
        if (editId === id) resetForm();
        alert("Student deleted successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to delete student.");
      });
  };

  const editStudent = (student) => {
    setEditId(student.id);
    setFormData({
      username: student.username || "",
      email: student.email || "",
      password_hash: "",
      numri_studentit: student.numri_studentit || "",
      programi: student.programi || "",
      viti_studimit: student.viti_studimit || "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-300 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-700">
          Students Management
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">
              {editId ? "Edit Student" : "Add Student"}
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
                name="numri_studentit"
                placeholder="Student Number"
                value={formData.numri_studentit}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="programi"
                placeholder="Program"
                value={formData.programi}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />

              <input
                type="number"
                name="viti_studimit"
                placeholder="Year"
                value={formData.viti_studimit}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <button
                    onClick={updateStudent}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={addStudent}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Add Student
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold">Students List</h2>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-700">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Student Number</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">{student.id}</td>
                      <td className="px-4 py-3">{student.username}</td>
                      <td className="px-4 py-3">{student.email}</td>
                      <td className="px-4 py-3">{student.numri_studentit}</td>
                      <td className="px-4 py-3">{student.programi}</td>
                      <td className="px-4 py-3">{student.viti_studimit}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editStudent(student)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan="7">
                      No students found.
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

export default Students;

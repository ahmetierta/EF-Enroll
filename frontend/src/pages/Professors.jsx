import React, { useEffect, useState } from "react";
import axios from "axios";

const Professors = () => {
  const [professors, setProfessors] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password_hash: "",
    titulli: "",
    departamenti: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = () => {
    axios
      .get("http://localhost:5000/professors")
      .then((res) => setProfessors(res.data))
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password_hash: "",
      titulli: "",
      departamenti: "",
    });
    setEditId(null);
  };

  const addProfessor = () => {
    axios
      .post("http://localhost:5000/professors", formData)
      .then(() => {
        fetchProfessors();
        resetForm();
        alert("Profesori u shtua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë shtimit");
      });
  };

  const updateProfessor = () => {
    axios
      .put(`http://localhost:5000/professors/${editId}`, formData)
      .then(() => {
        fetchProfessors();
        resetForm();
        alert("Profesori u përditësua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë përditësimit");
      });
  };

  const deleteProfessor = (id) => {
    if (!window.confirm("A don me fshi këtë profesor?")) return;

    axios
      .delete(`http://localhost:5000/professors/${id}`)
      .then(() => {
        fetchProfessors();
        if (editId === id) resetForm();
        alert("Profesori u fshi me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë fshirjes");
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
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-8 text-3xl font-bold text-blue-400">
          Professors Management
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                name="password_hash"
                placeholder="Password"
                value={formData.password_hash}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                name="titulli"
                placeholder="Title (Dr., Prof.)"
                value={formData.titulli}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                name="departamenti"
                placeholder="Department"
                value={formData.departamenti}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <button
                    onClick={updateProfessor}
                    className="flex-1 rounded-lg bg-blue-500 px-4 py-3 hover:bg-blue-600"
                  >
                    Update
                  </button>

                  <button
                    onClick={resetForm}
                    className="flex-1 rounded-lg bg-slate-700 px-4 py-3 hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={addProfessor}
                  className="w-full rounded-lg bg-blue-500 px-4 py-3 hover:bg-blue-600"
                >
                  Add Professor
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

            <h2 className="mb-6 text-xl font-semibold">
              Professors List
            </h2>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700 text-blue-300">
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
                      className="border-b border-slate-800 hover:bg-slate-800/50"
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
                            className="rounded-lg bg-white px-3 py-2 text-black"
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
                    <td className="px-4 py-6 text-slate-400" colSpan="6">
                      Nuk ka profesorë të regjistruar.
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
import React, { useEffect, useState } from "react";
import axios from "axios";

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);

  const [formData, setFormData] = useState({
    emertimi: "",
    data_fillimit: "",
    data_perfundimit: "",
    statusi: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = () => {
    axios
      .get("http://localhost:5000/semesters")
      .then((res) => setSemesters(res.data))
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
      emertimi: "",
      data_fillimit: "",
      data_perfundimit: "",
      statusi: "",
    });
    setEditId(null);
  };

  const addSemester = () => {
    axios
      .post("http://localhost:5000/semesters", formData)
      .then(() => {
        fetchSemesters();
        resetForm();
        alert("Semestri u shtua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë shtimit");
      });
  };

  const updateSemester = () => {
    axios
      .put(`http://localhost:5000/semesters/${editId}`, formData)
      .then(() => {
        fetchSemesters();
        resetForm();
        alert("Semestri u përditësua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë përditësimit");
      });
  };

  const deleteSemester = (id) => {
    if (!window.confirm("A don me fshi këtë semestër?")) return;

    axios
      .delete(`http://localhost:5000/semesters/${id}`)
      .then(() => {
        fetchSemesters();
        if (editId === id) resetForm();
        alert("Semestri u fshi me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë fshirjes");
      });
  };

  const editSemester = (semester) => {
    setEditId(semester.id);
    setFormData({
      emertimi: semester.emertimi || "",
      data_fillimit: semester.data_fillimit?.slice(0, 10) || "",
      data_perfundimit: semester.data_perfundimit?.slice(0, 10) || "",
      statusi: semester.statusi || "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-400">
          Semesters Management
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">
              {editId ? "Edit Semester" : "Add Semester"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="emertimi"
                placeholder="Semester Name"
                value={formData.emertimi}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="date"
                name="data_fillimit"
                value={formData.data_fillimit}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="date"
                name="data_perfundimit"
                value={formData.data_perfundimit}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                name="statusi"
                placeholder="Status"
                value={formData.statusi}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
              />
            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <button
                    onClick={updateSemester}
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
                  onClick={addSemester}
                  className="w-full rounded-lg bg-blue-500 px-4 py-3 hover:bg-blue-600"
                >
                  Add Semester
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold">Semesters List</h2>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700 text-blue-300">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {semesters.length > 0 ? (
                  semesters.map((semester) => (
                    <tr
                      key={semester.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">{semester.id}</td>
                      <td className="px-4 py-3">{semester.emertimi}</td>
                      <td className="px-4 py-3">
                        {semester.data_fillimit?.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        {semester.data_perfundimit?.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">{semester.statusi}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editSemester(semester)}
                            className="rounded-lg bg-white px-3 py-2 text-black"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteSemester(semester.id)}
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
                      Nuk ka semestre të regjistruar.
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

export default Semesters;
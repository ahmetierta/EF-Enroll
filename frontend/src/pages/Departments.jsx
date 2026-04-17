import React, { useEffect, useState } from "react";
import axios from "axios";

const Departments = () => {
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    emertimi: "",
    pershkrimi: "",
    shefi_departamentit: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

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
    setFormData({
      emertimi: "",
      pershkrimi: "",
      shefi_departamentit: "",
    });
    setEditId(null);
  };

  const addDepartment = () => {
    axios
      .post("http://localhost:5000/departments", formData)
      .then(() => {
        fetchDepartments();
        resetForm();
        alert("Departamenti u shtua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë shtimit");
      });
  };

  const updateDepartment = () => {
    axios
      .put(`http://localhost:5000/departments/${editId}`, formData)
      .then(() => {
        fetchDepartments();
        resetForm();
        alert("Departamenti u përditësua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë përditësimit");
      });
  };

  const deleteDepartment = (id) => {
    if (!window.confirm("A don me fshi këtë departament?")) return;

    axios
      .delete(`http://localhost:5000/departments/${id}`)
      .then(() => {
        fetchDepartments();
        if (editId === id) resetForm();
        alert("Departamenti u fshi me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjatë fshirjes");
      });
  };

  const editDepartment = (department) => {
    setEditId(department.id);
    setFormData({
      emertimi: department.emertimi || "",
      pershkrimi: department.pershkrimi || "",
      shefi_departamentit: department.shefi_departamentit || "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-400">
          Departments Management
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">
              {editId ? "Edit Department" : "Add Department"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="emertimi"
                placeholder="Department Name"
                value={formData.emertimi}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <textarea
                name="pershkrimi"
                placeholder="Description"
                value={formData.pershkrimi}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="shefi_departamentit"
                placeholder="Head of Department"
                value={formData.shefi_departamentit}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <button
                    onClick={updateDepartment}
                    className="flex-1 rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 rounded-lg bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={addDepartment}
                  className="w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-600"
                >
                  Add Department
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold">Departments List</h2>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700 text-blue-300">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Head</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {departments.length > 0 ? (
                  departments.map((department) => (
                    <tr
                      key={department.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">{department.id}</td>
                      <td className="px-4 py-3">{department.emertimi}</td>
                      <td className="px-4 py-3">{department.pershkrimi}</td>
                      <td className="px-4 py-3">{department.shefi_departamentit}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editDepartment(department)}
                            className="rounded-lg bg-white px-3 py-2 text-black hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDepartment(department.id)}
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
                    <td className="px-4 py-6 text-slate-400" colSpan="5">
                      Nuk ka departamente të regjistruara.
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

export default Departments;
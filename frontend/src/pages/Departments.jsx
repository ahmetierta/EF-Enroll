import React, { useEffect, useState } from "react";
import axios from "axios";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import TextArea from "../components/ui/TextArea";
import TextInput from "../components/ui/TextInput";

const initialFormData = {
  emertimi: "",
  pershkrimi: "",
  shefi_departamentit: "",
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);

  function fetchDepartments() {
    axios
      .get("http://localhost:5000/departments")
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

  const resetForm = () => {
    setFormData(initialFormData);
    setEditId(null);
  };

  const addDepartment = () => {
    axios
      .post("http://localhost:5000/departments", formData)
      .then(() => {
        fetchDepartments();
        resetForm();
        alert("Department added successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to add department.");
      });
  };

  const updateDepartment = () => {
    axios
      .put(`http://localhost:5000/departments/${editId}`, formData)
      .then(() => {
        fetchDepartments();
        resetForm();
        alert("Department updated successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to update department.");
      });
  };

  const deleteDepartment = (id) => {
    if (!window.confirm("Do you want to delete this department?")) return;

    axios
      .delete(`http://localhost:5000/departments/${id}`)
      .then(() => {
        fetchDepartments();
        if (editId === id) resetForm();
        alert("Department deleted successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to delete department.");
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
    <PageContainer title="Departments Management">
      <div className="grid gap-8 lg:grid-cols-3">
        <FormCard title={editId ? "Edit Department" : "Add Department"}>
          <div className="space-y-4">
            <TextInput
              name="emertimi"
              placeholder="Department Name"
              value={formData.emertimi}
              onChange={handleChange}
            />

            <TextArea
              name="pershkrimi"
              placeholder="Description"
              value={formData.pershkrimi}
              onChange={handleChange}
            />

            <TextInput
              name="shefi_departamentit"
              placeholder="Head of Department"
              value={formData.shefi_departamentit}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6 flex gap-3">
            {editId ? (
              <>
                <Button onClick={updateDepartment} className="flex-1">
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
              <Button onClick={addDepartment} fullWidth>
                Add Department
              </Button>
            )}
          </div>
        </FormCard>

        <TableCard title="Departments List">
          <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-700">
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
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">{department.id}</td>
                      <td className="px-4 py-3">{department.emertimi}</td>
                      <td className="px-4 py-3">{department.pershkrimi}</td>
                      <td className="px-4 py-3">
                        {department.shefi_departamentit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => editDepartment(department)}
                            className="px-3 py-2"
                            variant="ghost"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteDepartment(department.id)}
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
                    <td className="px-4 py-6 text-slate-500" colSpan="5">
                      No departments found.
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

export default Departments;

import React, { useEffect, useState } from "react";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import { semesterService } from "../services/semesterService";

const initialFormData = {
  emertimi: "",
  data_fillimit: "",
  data_perfundimit: "",
  statusi: "",
};

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);

  function fetchSemesters() {
    semesterService
      .getAll()
      .then((res) => setSemesters(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchSemesters();
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

  const addSemester = () => {
    semesterService
      .create(formData)
      .then(() => {
        fetchSemesters();
        resetForm();
        alert("Semester added successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to add semester.");
      });
  };

  const updateSemester = () => {
    semesterService
      .update(editId, formData)
      .then(() => {
        fetchSemesters();
        resetForm();
        alert("Semester updated successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to update semester.");
      });
  };

  const deleteSemester = (id) => {
    if (!window.confirm("Do you want to delete this semester?")) return;

    semesterService
      .remove(id)
      .then(() => {
        fetchSemesters();
        if (editId === id) resetForm();
        alert("Semester deleted successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to delete semester.");
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
    <PageContainer title="Semesters Management">
      <div className="grid gap-8 lg:grid-cols-3">
        <FormCard title={editId ? "Edit Semester" : "Add Semester"}>
          <div className="space-y-4">
            <TextInput
              name="emertimi"
              placeholder="Semester Name"
              value={formData.emertimi}
              onChange={handleChange}
            />

            <TextInput
              type="date"
              name="data_fillimit"
              value={formData.data_fillimit}
              onChange={handleChange}
            />

            <TextInput
              type="date"
              name="data_perfundimit"
              value={formData.data_perfundimit}
              onChange={handleChange}
            />

            <TextInput
              name="statusi"
              placeholder="Status"
              value={formData.statusi}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6 flex gap-3">
            {editId ? (
              <>
                <Button onClick={updateSemester} className="flex-1">
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
              <Button onClick={addSemester} fullWidth>
                Add Semester
              </Button>
            )}
          </div>
        </FormCard>

        <TableCard title="Semesters List">
          <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-700">
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
                      className="border-b border-slate-200 hover:bg-slate-50"
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
                          <Button
                            onClick={() => editSemester(semester)}
                            className="px-3 py-2"
                            variant="ghost"
                          >
                            Edit
                          </Button>

                          <Button
                            onClick={() => deleteSemester(semester.id)}
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
                      No semesters found.
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

export default Semesters;

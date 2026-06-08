import React, { useEffect, useState } from "react";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import StatusMessage from "../components/ui/StatusMessage";
import TextInput from "../components/ui/TextInput";
import { getApiErrorMessage } from "../utils/apiErrors";
import { departmentService } from "../services/departmentService";
import { professorService } from "../services/professorService";
import {
  professorProfileSchema,
  validateForm,
} from "../validation/schemas";

const initialFormData = {
  username: "",
  email: "",
  titulli: "",
  departamenti: "",
};

function formatSchedule(schedule) {
  const start = String(schedule.ora_fillimit || "").slice(0, 5);
  const end = String(schedule.ora_perfundimit || "").slice(0, 5);
  const time = start && end ? `${start}-${end}` : "Time not set";

  return [schedule.dita, time, schedule.salla].filter(Boolean).join(", ");
}

const Professors = () => {
  const [professors, setProfessors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [notice, setNotice] = useState(null);

  function fetchProfessors() {
    professorService
      .getAll()
      .then((res) => setProfessors(res.data))
      .catch((err) =>
        setNotice({
          type: "error",
          message: getApiErrorMessage(err, "Professors could not be loaded."),
        })
      );
  }

  function fetchDepartments() {
    departmentService
      .getAll()
      .then((res) => setDepartments(res.data))
      .catch((err) =>
        setNotice({
          type: "error",
          message: getApiErrorMessage(err, "Departments could not be loaded."),
        })
      );
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

  const updateProfessor = async () => {
    const validationError = await validateForm(professorProfileSchema, formData);

    if (validationError) {
      setNotice({ type: "error", message: validationError });
      return;
    }

    professorService
      .update(editId, formData)
      .then(() => {
        fetchProfessors();
        resetForm();
        setNotice({ type: "success", message: "Professor updated successfully." });
      })
      .catch((err) => {
        setNotice({ type: "error", message: getApiErrorMessage(err, "Failed to update professor.") });
      });
  };

  const deleteProfessor = (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setNotice({ type: "info", message: "Click Delete again to confirm." });
      return;
    }

    professorService
      .remove(id)
      .then(() => {
        fetchProfessors();
        if (editId === id) resetForm();
        setConfirmDeleteId(null);
        setNotice({ type: "success", message: "Professor deleted successfully." });
      })
      .catch((err) => {
        setNotice({ type: "error", message: getApiErrorMessage(err, "Failed to delete professor.") });
      });
  };

  const editProfessor = (professor) => {
    setEditId(professor.id);
    setFormData({
      username: professor.username || "",
      email: professor.email || "",
      titulli: professor.titulli || "",
      departamenti: professor.departamenti || "",
    });
  };

  return (
    <PageContainer title="Professors Management">
      <div className="mb-6">
        <StatusMessage message={notice?.message} type={notice?.type} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <FormCard title={editId ? "Edit Professor" : "Professor Accounts"}>
          {editId ? (
            <>
              <div className="space-y-4">
                <TextInput
                  name="username"
                  placeholder="Full name"
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
              </div>
            </>
          ) : (
            <div className="space-y-4 text-sm leading-6 text-slate-600">
              <p>
                Professors create their own account from the register page.
                Admins can approve pending accounts and edit professor profile
                details after registration.
              </p>
              <p>
                Select a professor from the table to update their title or
                department.
              </p>
            </div>
          )}
        </FormCard>

        <TableCard title="Professors List">
          <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-700">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Full name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Scheduled Courses</th>
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
                      <td className="max-w-sm px-4 py-3 text-sm text-slate-600">
                        {professor.scheduled_courses?.length ? (
                          <div className="space-y-2">
                            {professor.scheduled_courses.map((course) => (
                              <div
                                key={course.id}
                                className="rounded border border-slate-200 bg-slate-50 px-3 py-2"
                              >
                                <p className="font-semibold text-slate-900">
                                  {course.emertimi}
                                </p>
                                <p>
                                  {course.schedules.map(formatSchedule).join("; ")}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          "No scheduled courses"
                        )}
                      </td>

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
                            {confirmDeleteId === professor.id ? "Confirm" : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan="7">
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

import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import StatusMessage from "../components/ui/StatusMessage";
import TextArea from "../components/ui/TextArea";
import TextInput from "../components/ui/TextInput";
import { departmentService } from "../services/departmentService";
import { professorService } from "../services/professorService";
import { getApiErrorMessage } from "../utils/apiErrors";
import { departmentSchema, validateForm } from "../validation/schemas";

const initialFormData = {
  emertimi: "",
  pershkrimi: "",
  shefi_departamentit: "",
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to load departments."));
    } finally {
      setIsLoading(false);
    }
  }, [showNotice]);

  const fetchProfessors = useCallback(async () => {
    try {
      const res = await professorService.getAll();
      setProfessors(res.data);
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to load professors."));
    }
  }, [showNotice]);

  useEffect(() => {
    fetchDepartments();
    fetchProfessors();
  }, [fetchDepartments, fetchProfessors]);

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

  const addDepartment = async () => {
    const validationError = await validateForm(departmentSchema, formData);

    if (validationError) {
      showNotice("error", validationError);
      return;
    }

    setIsSaving(true);

    try {
      await departmentService.create(formData);
      await fetchDepartments();
      resetForm();
      showNotice("success", "Department added successfully.");
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to add department."));
    } finally {
      setIsSaving(false);
    }
  };

  const updateDepartment = async () => {
    const validationError = await validateForm(departmentSchema, formData);

    if (validationError) {
      showNotice("error", validationError);
      return;
    }

    setIsSaving(true);

    try {
      await departmentService.update(editId, formData);
      await fetchDepartments();
      resetForm();
      showNotice("success", "Department updated successfully.");
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to update department."));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Do you want to delete this department?")) return;

    setDeletingId(id);

    try {
      await departmentService.remove(id);
      await fetchDepartments();
      if (editId === id) resetForm();
      showNotice("success", "Department deleted successfully.");
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to delete department."));
    } finally {
      setDeletingId(null);
    }
  };

  const editDepartment = (department) => {
    setEditId(department.id);
    setFormData({
      emertimi: department.emertimi || "",
      pershkrimi: department.pershkrimi || "",
      shefi_departamentit: department.shefi_departamentit || "",
    });
  };

  const summary = useMemo(() => {
    const heads = departments.filter((department) =>
      Boolean(department.shefi_departamentit)
    ).length;

    return {
      total: departments.length,
      withHeads: heads,
      withoutHeads: departments.length - heads,
      professors: professors.length,
    };
  }, [departments, professors]);

  return (
    <PageContainer title="Departments Management">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Departments</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">With heads</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {summary.withHeads}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Missing heads</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.withoutHeads}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Professors</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.professors}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <StatusMessage message={notice?.message} type={notice?.type} />
      </div>

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

            <SelectInput
              name="shefi_departamentit"
              value={formData.shefi_departamentit}
              onChange={handleChange}
            >
              <option value="">Select Head of Department</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.username}>
                  {professor.username} {professor.titulli ? `(${professor.titulli})` : ""}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="mt-6 flex gap-3">
            {editId ? (
              <>
                <Button
                  onClick={updateDepartment}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Update"}
                </Button>
                <Button
                  onClick={resetForm}
                  className="flex-1"
                  variant="secondary"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={addDepartment} fullWidth disabled={isSaving}>
                {isSaving ? "Saving..." : "Add Department"}
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
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan="5">
                      Loading departments...
                    </td>
                  </tr>
                ) : departments.length > 0 ? (
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
                            disabled={deletingId === department.id}
                          >
                            {deletingId === department.id ? "Deleting..." : "Delete"}
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

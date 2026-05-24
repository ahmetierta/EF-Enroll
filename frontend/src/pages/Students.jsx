import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import StatusMessage from "../components/ui/StatusMessage";
import TextInput from "../components/ui/TextInput";
import { courseService } from "../services/courseService";
import { studentService } from "../services/studentService";
import { getApiErrorMessage } from "../utils/apiErrors";
import { getAuthUser } from "../utils/authStorage";
import {
  studentManagementSchema,
  validateForm,
} from "../validation/schemas";

const initialFormData = {
  username: "",
  email: "",
  password: "",
  numri_studentit: "",
  programi: "",
  viti_studimit: "",
};

const initialFilters = {
  search: "",
  course_id: "",
  programi: "",
  viti_studimit: "",
  statusi: "",
  payment_status: "",
  sort_by: "newest",
  sort_order: "desc",
};

const programOptions = [
  "Computer Science",
  "Software Engineering",
  "Information Systems",
  "Business Administration",
  "Data Science",
  "Cybersecurity",
];

const yearOptions = [1, 2, 3, 4, 5];

const Students = () => {
  const authUser = getAuthUser();
  const canManageStudents = authUser?.role === "admin";
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [filters, setFilters] = useState(initialFilters);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const fetchStudents = useCallback(
    async (params = initialFilters) => {
      setIsLoading(true);

      try {
        const res = await studentService.getAll(params);
        setStudents(res.data);
      } catch (err) {
        showNotice("error", getApiErrorMessage(err, "Failed to load students."));
      } finally {
        setIsLoading(false);
      }
    },
    [showNotice]
  );

  const fetchCourses = useCallback(
    async () => {
      try {
        const res = await courseService.getAll();
        setCourses(res.data);
      } catch (err) {
        showNotice("error", getApiErrorMessage(err, "Failed to load courses."));
      }
    },
    [showNotice]
  );

  useEffect(() => {
    fetchStudents(initialFilters);
    fetchCourses();
  }, [fetchCourses, fetchStudents]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    fetchStudents(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    fetchStudents(initialFilters);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditId(null);
  };

  const addStudent = async () => {
    const validationError = await validateForm(
      studentManagementSchema(false),
      formData
    );

    if (validationError) {
      showNotice("error", validationError);
      return;
    }

    setIsSaving(true);

    try {
      await studentService.create(formData);
      await fetchStudents(filters);
      resetForm();
      showNotice("success", "Student added successfully.");
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to add student."));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStudent = async () => {
    const validationError = await validateForm(
      studentManagementSchema(true),
      formData
    );

    if (validationError) {
      showNotice("error", validationError);
      return;
    }

    setIsSaving(true);

    try {
      await studentService.update(editId, formData);
      await fetchStudents(filters);
      resetForm();
      showNotice("success", "Student updated successfully.");
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to update student."));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Do you want to delete this student?")) return;

    setDeletingId(id);

    try {
      await studentService.remove(id);
      await fetchStudents(filters);
      if (editId === id) resetForm();
      showNotice("success", "Student deleted successfully.");
    } catch (err) {
      showNotice("error", getApiErrorMessage(err, "Failed to delete student."));
    } finally {
      setDeletingId(null);
    }
  };

  const editStudent = (student) => {
    setEditId(student.id);
    setFormData({
      username: student.username || "",
      email: student.email || "",
      password: "",
      numri_studentit: student.numri_studentit || "",
      programi: student.programi || "",
      viti_studimit: student.viti_studimit || "",
    });
  };

  const summary = useMemo(() => {
    const programs = new Set(
      students.map((student) => student.programi).filter(Boolean)
    );
    const years = new Set(
      students.map((student) => student.viti_studimit).filter(Boolean)
    );
    const activeFilterCount = Object.entries(filters).filter(
      ([key, value]) =>
        value &&
        !["sort_by", "sort_order"].includes(key) &&
        value !== initialFilters[key]
    ).length;

    return {
      total: students.length,
      programs: programs.size,
      years: years.size,
      activeFilterCount,
    };
  }, [filters, students]);

  return (
    <PageContainer
      title={canManageStudents ? "Students Management" : "My Course Students"}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Students shown</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Programs</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {summary.programs}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Study years</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.years}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Active filters</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.activeFilterCount}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <StatusMessage message={notice?.message} type={notice?.type} />
      </div>

      <div className={`grid gap-8 ${canManageStudents ? "lg:grid-cols-3" : ""}`}>
        {canManageStudents && (
        <FormCard title={editId ? "Edit Student" : "Add Student"}>
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
              name="password"
              placeholder={editId ? "New password (optional)" : "Password"}
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            <TextInput
              name="numri_studentit"
              placeholder="Student Number"
              value={formData.numri_studentit}
              onChange={handleChange}
            />

            <SelectInput
              name="programi"
              value={formData.programi}
              onChange={handleChange}
            >
              <option value="">Select Program</option>
              {programOptions.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </SelectInput>

            <SelectInput
              name="viti_studimit"
              value={formData.viti_studimit}
              onChange={handleChange}
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="mt-6 flex gap-3">
            {editId ? (
              <>
                <Button
                  onClick={updateStudent}
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
              <Button onClick={addStudent} fullWidth disabled={isSaving}>
                {isSaving ? "Saving..." : "Add Student"}
              </Button>
            )}
          </div>
        </FormCard>
        )}

        <div className={canManageStudents ? "lg:col-span-3" : ""}>
          <FormCard title="Filter Students">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TextInput
                name="search"
                placeholder="Search name, email, or student number"
                value={filters.search}
                onChange={handleFilterChange}
              />

              <SelectInput
                name="course_id"
                value={filters.course_id}
                onChange={handleFilterChange}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.emertimi}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                name="programi"
                value={filters.programi}
                onChange={handleFilterChange}
              >
                <option value="">All Programs</option>
                {programOptions.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                name="viti_studimit"
                value={filters.viti_studimit}
                onChange={handleFilterChange}
              >
                <option value="">All Years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                name="statusi"
                value={filters.statusi}
                onChange={handleFilterChange}
              >
                <option value="">Any Enrollment Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </SelectInput>

              <SelectInput
                name="payment_status"
                value={filters.payment_status}
                onChange={handleFilterChange}
              >
                <option value="">Any Payment Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </SelectInput>

              <SelectInput
                name="sort_by"
                value={filters.sort_by}
                onChange={handleFilterChange}
              >
                <option value="newest">Newest</option>
                <option value="username">Username</option>
                <option value="student_number">Student Number</option>
                <option value="program">Program</option>
                <option value="year">Year</option>
              </SelectInput>

              <SelectInput
                name="sort_order"
                value={filters.sort_order}
                onChange={handleFilterChange}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </SelectInput>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={applyFilters} disabled={isLoading}>
                {isLoading ? "Loading..." : "Apply Filters"}
              </Button>
              <Button onClick={resetFilters} variant="secondary" disabled={isLoading}>
                Clear Filters
              </Button>
              <span className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                {students.length} students shown
              </span>
            </div>
          </FormCard>
        </div>

        <TableCard title="Students List">
          <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-blue-700">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Student Number</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Year</th>
                  {canManageStudents && (
                    <th className="px-4 py-3">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-slate-500"
                      colSpan={canManageStudents ? "7" : "6"}
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
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
                      {canManageStudents && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => editStudent(student)}
                              className="px-3 py-2"
                              variant="ghost"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteStudent(student.id)}
                              className="px-3 py-2"
                              variant="danger"
                              disabled={deletingId === student.id}
                            >
                              {deletingId === student.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-slate-500"
                      colSpan={canManageStudents ? "7" : "6"}
                    >
                      No students found.
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

export default Students;

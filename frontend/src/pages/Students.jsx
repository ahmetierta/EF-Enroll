import React, { useCallback, useEffect, useState } from "react";
import FormCard from "../components/layout/FormCard";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import { courseService } from "../services/courseService";
import { studentService } from "../services/studentService";
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

  const fetchStudents = useCallback((params = initialFilters) => {
    studentService
      .getAll(params)
      .then((res) => setStudents(res.data))
      .catch((err) => console.log(err));
  }, []);

  const fetchCourses = useCallback(() => {
    courseService
      .getAll()
      .then((res) => setCourses(res.data))
      .catch((err) => console.log(err));
  }, []);

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
      alert(validationError);
      return;
    }

    studentService
      .create(formData)
      .then(() => {
        fetchStudents(filters);
        resetForm();
        alert("Student added successfully.");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to add student.");
      });
  };

  const updateStudent = async () => {
    const validationError = await validateForm(
      studentManagementSchema(true),
      formData
    );

    if (validationError) {
      alert(validationError);
      return;
    }

    studentService
      .update(editId, formData)
      .then(() => {
        fetchStudents(filters);
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

    studentService
      .remove(id)
      .then(() => {
        fetchStudents(filters);
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
      password: "",
      numri_studentit: student.numri_studentit || "",
      programi: student.programi || "",
      viti_studimit: student.viti_studimit || "",
    });
  };

  return (
    <PageContainer
      title={canManageStudents ? "Students Management" : "My Course Students"}
    >
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
                <Button onClick={updateStudent} className="flex-1">
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
              <Button onClick={addStudent} fullWidth>
                Add Student
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
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button onClick={resetFilters} variant="secondary">
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
                            >
                              Delete
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

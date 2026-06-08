import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import StatusMessage from "../components/ui/StatusMessage";
import TextArea from "../components/ui/TextArea";
import TextInput from "../components/ui/TextInput";
import { courseService } from "../services/courseService";
import { professorService } from "../services/professorService";
import { semesterService } from "../services/semesterService";
import { getApiErrorMessage } from "../utils/apiErrors";
import { getAuthUser } from "../utils/authStorage";
import { courseSchema, validateForm } from "../validation/schemas";

const initialFormData = {
  emertimi: "",
  pershkrimi: "",
  kredite: "",
  professor_id: "",
  semester_id: "",
  kapaciteti: "",
  cmimi: "",
};

function formatSchedule(schedule) {
  const start = String(schedule.ora_fillimit || "").slice(0, 5);
  const end = String(schedule.ora_perfundimit || "").slice(0, 5);
  const time = start && end ? `${start}-${end}` : "Time not set";

  return [schedule.dita, time, schedule.salla].filter(Boolean).join(", ");
}

function getScheduleLabel(course) {
  if (course.schedule_summary) {
    return course.schedule_summary;
  }

  if (course.schedules?.length) {
    return course.schedules.map(formatSchedule).join("; ");
  }

  return "No schedule set";
}

const Courses = () => {
  const authUser = getAuthUser();
  const canManageCourses = authUser?.role === "admin";
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [notice, setNotice] = useState(null);

  function fetchCourses() {
    courseService
      .getAll()
      .then((res) => setCourses(res.data))
      .catch((err) =>
        setNotice({
          type: "error",
          message: getApiErrorMessage(err, "Courses could not be loaded."),
        })
      );
  }

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

  function fetchSemesters() {
    semesterService
      .getAll()
      .then((res) => setSemesters(res.data))
      .catch((err) =>
        setNotice({
          type: "error",
          message: getApiErrorMessage(err, "Semesters could not be loaded."),
        })
      );
  }

  useEffect(() => {
    fetchCourses();
    if (canManageCourses) {
      fetchProfessors();
      fetchSemesters();
    }
  }, [canManageCourses]);

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

  const addCourse = async () => {
    if (!canManageCourses) {
      setNotice({ type: "error", message: "Only admins can add courses." });
      return;
    }

    const validationError = await validateForm(courseSchema, formData);

    if (validationError) {
      setNotice({ type: "error", message: validationError });
      return;
    }

    courseService
      .create(formData)
      .then(() => {
        fetchCourses();
        resetForm();
        setNotice({ type: "success", message: "Course added successfully." });
      })
      .catch((err) => {
        setNotice({ type: "error", message: getApiErrorMessage(err, "Failed to add course.") });
      });
  };

  const updateCourse = async () => {
    if (!canManageCourses) {
      setNotice({ type: "error", message: "Only admins can update courses." });
      return;
    }

    const validationError = await validateForm(courseSchema, formData);

    if (validationError) {
      setNotice({ type: "error", message: validationError });
      return;
    }

    courseService
      .update(editId, formData)
      .then(() => {
        fetchCourses();
        resetForm();
        setNotice({ type: "success", message: "Course updated successfully." });
      })
      .catch((err) => {
        setNotice({ type: "error", message: getApiErrorMessage(err, "Failed to update course.") });
      });
  };

  const deleteCourse = (id) => {
    if (!canManageCourses) {
      setNotice({ type: "error", message: "Only admins can delete courses." });
      return;
    }

    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setNotice({ type: "info", message: "Click Delete again to confirm." });
      return;
    }

    courseService
      .remove(id)
      .then(() => {
        fetchCourses();
        if (editId === id) resetForm();
        setConfirmDeleteId(null);
        setNotice({ type: "success", message: "Course deleted successfully." });
      })
      .catch((err) => {
        setNotice({ type: "error", message: getApiErrorMessage(err, "Failed to delete course.") });
      });
  };

  const editCourse = (course) => {
    setEditId(course.id);
    setFormData({
      emertimi: course.emertimi || "",
      pershkrimi: course.pershkrimi || "",
      kredite: course.kredite || "",
      professor_id: course.professor_id || "",
      semester_id: course.semester_id || "",
      kapaciteti: course.kapaciteti || "",
      cmimi: course.cmimi || "",
    });
  };

  const displayedCourses =
    authUser?.role === "professor"
      ? courses.filter((course) => course.schedules?.length)
      : courses;
  const totalCapacity = displayedCourses.reduce(
    (sum, course) => sum + Number(course.kapaciteti || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.5fr_1fr] lg:px-10">
            <div>
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                EF Enroll Courses
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Manage courses with a cleaner academic dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 lg:text-base">
                Create course offers, assign professors, connect semesters, and
                keep capacity details organized in one place.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-lg border border-slate-200 bg-slate-900 p-5 text-white">
                <p className="text-sm text-slate-300">Total Courses</p>
                <p className="mt-2 text-3xl font-bold">
                  {displayedCourses.length}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm text-sky-700">Professors Available</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {professors.length}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm text-blue-700">Total Capacity</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalCapacity}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <StatusMessage message={notice?.message} type={notice?.type} />
        </div>

        <div className={`grid gap-8 ${canManageCourses ? "lg:grid-cols-3" : ""}`}>
          {canManageCourses && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              {editId ? "Edit Course" : "Add Course"}
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Fill in the course information and connect it with the right
              professor and semester.
            </p>

            <div className="space-y-4">
              <TextInput
                name="emertimi"
                placeholder="Course Name"
                value={formData.emertimi}
                onChange={handleChange}
                className="rounded-xl border-slate-200 focus:bg-white"
              />

              <TextArea
                name="pershkrimi"
                placeholder="Description"
                value={formData.pershkrimi}
                onChange={handleChange}
                className="rounded-xl border-slate-200 focus:bg-white"
              />

              <TextInput
                type="number"
                name="kredite"
                placeholder="Credits"
                value={formData.kredite}
                onChange={handleChange}
                className="rounded-xl border-slate-200 focus:bg-white"
              />

              <SelectInput
                name="professor_id"
                value={formData.professor_id}
                onChange={handleChange}
                className="rounded-xl border-slate-200 focus:bg-white"
              >
                <option value="">Select Professor</option>
                {professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.username} {professor.titulli ? `(${professor.titulli})` : ""}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                name="semester_id"
                value={formData.semester_id}
                onChange={handleChange}
                className="rounded-xl border-slate-200 focus:bg-white"
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.emertimi}
                  </option>
                ))}
              </SelectInput>

              <TextInput
                type="number"
                name="kapaciteti"
                placeholder="Capacity"
                value={formData.kapaciteti}
                onChange={handleChange}
                className="rounded-xl border-slate-200 focus:bg-white"
              />

              <TextInput
                type="number"
                name="cmimi"
                placeholder="Price"
                value={formData.cmimi}
                onChange={handleChange}
                className="rounded-xl border-slate-200 focus:bg-white"
                min="0"
                step="0.01"
              />
            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <Button
                    onClick={updateCourse}
                    className="flex-1 rounded-xl"
                  >
                    Update
                  </Button>
                  <Button
                    onClick={resetForm}
                    className="flex-1 rounded-xl border-slate-200"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={addCourse}
                  className="rounded-xl"
                  fullWidth
                >
                  Add Course
                </Button>
              )}
            </div>
          </div>
          )}

          <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${canManageCourses ? "lg:col-span-2" : ""}`}>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Courses List
                </h2>
                <p className="text-sm text-slate-500">
                  {authUser?.role === "professor"
                    ? "Review courses that already have scheduled terms."
                    : "Review, edit, and manage all course offers from one table."}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Professor</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {displayedCourses.length > 0 ? (
                  displayedCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="rounded-2xl bg-slate-50 text-sm text-slate-700 transition hover:bg-blue-50"
                    >
                      <td className="rounded-l-2xl px-4 py-4 font-semibold text-slate-900">
                        #{course.id}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {course.emertimi}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-slate-600">
                        {course.pershkrimi}
                      </td>
                      <td className="px-4 py-4">{course.kredite}</td>
                      <td className="px-4 py-3">
                        {course.professor_name || "No professor"}
                      </td>
                      <td className="px-4 py-3">
                        {course.semester_name || "No semester"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {course.kapaciteti} seats
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {Number(course.cmimi || 0).toFixed(2)} EUR
                      </td>
                      <td className="max-w-xs px-4 py-4 text-slate-600">
                        {getScheduleLabel(course)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {canManageCourses && (
                            <Button
                              onClick={() => editCourse(course)}
                              className="rounded-xl border-slate-200 px-3 py-2 hover:border-blue-200 hover:bg-blue-50"
                              variant="secondary"
                            >
                              Edit
                            </Button>
                          )}
                          <Link
                            to={`/materials?course_id=${course.id}`}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                          >
                            Materials
                          </Link>
                          {canManageCourses && (
                            <Button
                              onClick={() => deleteCourse(course.id)}
                              className="rounded-xl px-3 py-2"
                              variant="danger"
                            >
                              {confirmDeleteId === course.id ? "Confirm" : "Delete"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-400" colSpan="10">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;

import React, { useEffect, useState } from "react";
import axios from "axios";

const initialFormData = {
  emertimi: "",
  pershkrimi: "",
  kredite: "",
  professor_id: "",
  semester_id: "",
  kapaciteti: "",
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchProfessors();
    fetchSemesters();
  }, []);

  const fetchCourses = () => {
    axios
      .get("http://localhost:5000/courses")
      .then((res) => setCourses(res.data))
      .catch((err) => console.log(err));
  };

  const fetchProfessors = () => {
    axios
      .get("http://localhost:5000/professors")
      .then((res) => setProfessors(res.data))
      .catch((err) => console.log(err));
  };

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
    setFormData(initialFormData);
    setEditId(null);
  };

  const addCourse = () => {
    axios
      .post("http://localhost:5000/courses", formData)
      .then(() => {
        fetchCourses();
        resetForm();
        alert("Kursi u shtua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjate shtimit");
      });
  };

  const updateCourse = () => {
    axios
      .put(`http://localhost:5000/courses/${editId}`, formData)
      .then(() => {
        fetchCourses();
        resetForm();
        alert("Kursi u perditesua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjate perditesimit");
      });
  };

  const deleteCourse = (id) => {
    if (!window.confirm("A don me fshi kete kurs?")) return;

    axios
      .delete(`http://localhost:5000/courses/${id}`)
      .then(() => {
        fetchCourses();
        if (editId === id) resetForm();
        alert("Kursi u fshi me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjate fshirjes");
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
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-400">
          Courses Management
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">
              {editId ? "Edit Course" : "Add Course"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="emertimi"
                placeholder="Course Name"
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
                type="number"
                name="kredite"
                placeholder="Credits"
                value={formData.kredite}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <select
                name="professor_id"
                value={formData.professor_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">Select Professor</option>
                {professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.username} {professor.titulli ? `(${professor.titulli})` : ""}
                  </option>
                ))}
              </select>

              <select
                name="semester_id"
                value={formData.semester_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.emertimi}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="kapaciteti"
                placeholder="Capacity"
                value={formData.kapaciteti}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <button
                    onClick={updateCourse}
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
                  onClick={addCourse}
                  className="w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-600"
                >
                  Add Course
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold">Courses List</h2>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700 text-blue-300">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Professor</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">{course.id}</td>
                      <td className="px-4 py-3">{course.emertimi}</td>
                      <td className="px-4 py-3">{course.pershkrimi}</td>
                      <td className="px-4 py-3">{course.kredite}</td>
                      <td className="px-4 py-3">
                        {course.professor_name || "Pa profesor"}
                      </td>
                      <td className="px-4 py-3">
                        {course.semester_name || "Pa semester"}
                      </td>
                      <td className="px-4 py-3">{course.kapaciteti}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCourse(course)}
                            className="rounded-lg bg-white px-3 py-2 text-black hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCourse(course.id)}
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
                    <td className="px-4 py-6 text-slate-400" colSpan="8">
                      Nuk ka kurse te regjistruara.
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

export default Courses;

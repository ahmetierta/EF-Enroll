import React, { useEffect, useState } from "react";
import axios from "axios";

const initialFormData = {
  course_id: "",
  dita: "",
  ora_fillimit: "",
  ora_perfundimit: "",
  salla: "",
};

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
  }, []);

  const fetchSchedules = () => {
    axios
      .get("http://localhost:5000/schedules")
      .then((res) => setSchedules(res.data))
      .catch((err) => console.log(err));
  };

  const fetchCourses = () => {
    axios
      .get("http://localhost:5000/courses")
      .then((res) => setCourses(res.data))
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

  const addSchedule = () => {
    axios
      .post("http://localhost:5000/schedules", formData)
      .then(() => {
        fetchSchedules();
        resetForm();
        alert("Orari u shtua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjate shtimit");
      });
  };

  const updateSchedule = () => {
    axios
      .put(`http://localhost:5000/schedules/${editId}`, formData)
      .then(() => {
        fetchSchedules();
        resetForm();
        alert("Orari u perditesua me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjate perditesimit");
      });
  };

  const deleteSchedule = (id) => {
    if (!window.confirm("A don me fshi kete orar?")) return;

    axios
      .delete(`http://localhost:5000/schedules/${id}`)
      .then(() => {
        fetchSchedules();
        if (editId === id) resetForm();
        alert("Orari u fshi me sukses");
      })
      .catch((err) => {
        console.log(err);
        alert("Gabim gjate fshirjes");
      });
  };

  const editSchedule = (schedule) => {
    setEditId(schedule.id);
    setFormData({
      course_id: schedule.course_id || "",
      dita: schedule.dita || "",
      ora_fillimit: schedule.ora_fillimit?.slice(0, 5) || "",
      ora_perfundimit: schedule.ora_perfundimit?.slice(0, 5) || "",
      salla: schedule.salla || "",
    });
  };

  const uniqueRooms = new Set(
    schedules.map((schedule) => schedule.salla).filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-slate-300 p-6 text-slate-900 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.5fr_1fr] lg:px-10">
            <div>
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                EF Enroll Schedules
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Organize course schedules with time and room details
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 lg:text-base">
                Assign days, start and end times, and lecture rooms for each
                course from one clean scheduling page.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
                <p className="text-sm text-slate-300">Total Schedules</p>
                <p className="mt-2 text-3xl font-bold">{schedules.length}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-sky-700">Courses Ready</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {courses.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-blue-700">Rooms Used</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {uniqueRooms}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-lg shadow-blue-100/40">
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              {editId ? "Edit Schedule" : "Add Schedule"}
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Connect a course with its day, timing, and classroom.
            </p>

            <div className="space-y-4">
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.emertimi}
                  </option>
                ))}
              </select>

              <select
                name="dita"
                value={formData.dita}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>

              <input
                type="time"
                name="ora_fillimit"
                value={formData.ora_fillimit}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />

              <input
                type="time"
                name="ora_perfundimit"
                value={formData.ora_perfundimit}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />

              <input
                type="text"
                name="salla"
                placeholder="Room"
                value={formData.salla}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="mt-6 flex gap-3">
              {editId ? (
                <>
                  <button
                    onClick={updateSchedule}
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Update
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={addSchedule}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Add Schedule
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-lg shadow-blue-100/40 lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Schedules List
              </h2>
              <p className="text-sm text-slate-500">
                Manage all course schedules, times, and rooms from one table.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">End</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {schedules.length > 0 ? (
                    schedules.map((schedule) => (
                      <tr
                        key={schedule.id}
                        className="rounded-2xl bg-slate-50 text-sm text-slate-700 transition hover:bg-blue-50"
                      >
                        <td className="rounded-l-2xl px-4 py-4 font-semibold text-slate-900">
                          #{schedule.id}
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {schedule.course_name || "Pa kurs"}
                        </td>
                        <td className="px-4 py-4">{schedule.dita}</td>
                        <td className="px-4 py-4">
                          {schedule.ora_fillimit?.slice(0, 5)}
                        </td>
                        <td className="px-4 py-4">
                          {schedule.ora_perfundimit?.slice(0, 5)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {schedule.salla}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editSchedule(schedule)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="rounded-xl bg-red-500 px-3 py-2 text-white transition hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-10 text-center text-slate-400"
                        colSpan="7"
                      >
                        Nuk ka orare te regjistruara.
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

export default Schedules;

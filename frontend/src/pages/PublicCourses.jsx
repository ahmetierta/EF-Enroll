import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { courseService } from "../services/courseService";
import { getAuthUser } from "../utils/authStorage";

const PublicCourses = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const authUser = getAuthUser();

  function fetchCourses() {
    courseService
      .getAll()
      .then((res) => setCourses(res.data))
      .catch(() => setError("Courses could not be loaded."));
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = () => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    alert("Enrollment will be available after the enrollments module is added.");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="text-xl font-bold text-blue-700">
            EF Enroll
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
            Course Enrollment
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Browse available courses
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Students can review available courses here. To enroll in a course,
            they need to create an account and log in first.
          </p>
        </section>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.length > 0 ? (
            courses.map((course) => (
              <article
                key={course.id}
                className="flex min-h-64 flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {course.emertimi}
                    </h2>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {course.kredite} credits
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {course.pershkrimi || "No description available."}
                  </p>

                  <dl className="mt-5 grid gap-3 text-sm text-slate-700">
                    <div>
                      <dt className="font-semibold text-slate-950">Professor</dt>
                      <dd>{course.professor_name || "Not assigned"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-950">Semester</dt>
                      <dd>{course.semester_name || "Not assigned"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-950">Capacity</dt>
                      <dd>{course.kapaciteti || 0} seats</dd>
                    </div>
                  </dl>
                </div>

                <Button onClick={handleEnroll} className="mt-6" fullWidth>
                  Enroll
                </Button>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 md:col-span-2 xl:col-span-3">
              No courses are available yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PublicCourses;

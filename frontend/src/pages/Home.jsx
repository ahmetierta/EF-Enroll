import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { getRoleHomePath } from "../routes/roleRedirects";
import { courseService } from "../services/courseService";
import { getAuthUser } from "../utils/authStorage";
import { formatCoursePrice, getCourseImage } from "../utils/courseVisuals";

const heroImage =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1800&q=80";

const benefits = [
  {
    title: "Flexible duration",
    text: "Students can choose how many months they want to follow a course.",
  },
  {
    title: "Clear schedules",
    text: "Every course can show its professor, room, day, and start time.",
  },
  {
    title: "First-time offer",
    text: "New students can see a special offer before they enroll.",
  },
];

const Home = () => {
  const [courses, setCourses] = useState([]);
  const authUser = getAuthUser();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dashboardPath = getRoleHomePath(authUser?.role);

  const fetchCourses = useCallback(() => {
    courseService
      .getPublicAll()
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const featuredCourses = useMemo(() => courses.slice(0, 3), [courses]);
  const professors = useMemo(
    () => new Set(courses.map((course) => course.professor_name).filter(Boolean)),
    [courses]
  );
  const scheduledCourses = useMemo(
    () => courses.filter((course) => course.schedules?.length).length,
    [courses]
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local logout still clears client state if the server is unreachable.
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      <section
        className="relative min-h-[76vh] bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/65" />

        <header className="relative z-10 border-b border-white/20">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-8">
            <Link to="/" className="text-xl font-bold">
              EF Enroll
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                to="/"
                className="rounded-full border border-white/30 bg-white px-4 py-2 font-semibold text-slate-950 shadow-sm"
              >
                Home
              </Link>
              <Link
                to="/catalog"
                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
              >
                Catalog
              </Link>
              {authUser ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950 shadow-sm hover:bg-slate-100"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-14 pt-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Course enrollment platform
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-bold text-white lg:text-7xl">
            EF Enroll
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 lg:text-lg">
            Browse scheduled courses, compare prices and professors, then enroll
            with the duration that fits your plan.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/catalog"
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/20 hover:bg-cyan-300"
            >
              Browse Catalog
            </Link>
            {!authUser && (
              <Link
                to="/register/student"
                className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
              >
                Register as Student
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="border border-slate-300 bg-white p-5"
            >
              <h2 className="text-lg font-bold text-slate-950">
                {benefit.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {benefit.text}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 border border-slate-300 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Featured Courses
              </h2>
              <p className="text-sm text-slate-600">
                A quick look at current course offers.
              </p>
            </div>
            <Link
              to="/catalog"
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Open Catalog
            </Link>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-3">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course, index) => (
                <article
                  key={course.id}
                  className="overflow-hidden border border-slate-200 bg-slate-50"
                >
                  <img
                    src={getCourseImage(course, index)}
                    alt=""
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-blue-800">
                      {course.emertimi}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {course.pershkrimi || "No description available."}
                    </p>
                    <dl className="mt-4 grid gap-2 text-sm text-slate-700">
                      <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                        <dt>Professor</dt>
                        <dd className="font-semibold text-slate-950">
                          {course.professor_name || "Not assigned"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                        <dt>Price</dt>
                        <dd className="font-semibold text-slate-950">
                          {formatCoursePrice(course)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Seats</dt>
                        <dd className="font-semibold text-slate-950">
                          {course.available_seats} / {course.kapaciteti}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-4 text-sm text-slate-500 lg:col-span-3">
                No courses are available yet.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="border border-slate-300 bg-white p-5">
            <p className="text-sm text-slate-500">Courses</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {courses.length}
            </p>
          </div>
          <div className="border border-slate-300 bg-white p-5">
            <p className="text-sm text-slate-500">Professors</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {professors.size}
            </p>
          </div>
          <div className="border border-slate-300 bg-white p-5">
            <p className="text-sm text-slate-500">Scheduled Courses</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {scheduledCourses}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

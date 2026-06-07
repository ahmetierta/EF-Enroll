import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/navigation/PublicHeader";
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

const pageLinks = [
  { href: "#offers", label: "What we offer" },
  { href: "#courses", label: "Courses" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#stats", label: "Stats" },
];

const courseOfferings = [
  {
    title: "Scheduled learning",
    text: "Every course shows professor, day, room, and time so students can plan before enrolling.",
  },
  {
    title: "Materials by week",
    text: "Slides, readings, assignments, quizzes, videos, and resources can be organized by module.",
  },
  {
    title: "Duration choices",
    text: "Students can choose 1, 3, 6, or 12 months and see the final price before enrollment.",
  },
  {
    title: "Payments and invoices",
    text: "Enrollments can be paid with invoice number, transaction id, method, and refund support.",
  },
];

const processSteps = [
  "Browse the catalog and compare courses.",
  "Choose duration and enroll as a student.",
  "Pay the enrollment or join the waiting list if the course is full.",
  "Open materials and follow course updates from your dashboard.",
];

const Home = () => {
  const [courses, setCourses] = useState([]);
  const authUser = getAuthUser();

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

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      <PublicHeader activePage="home" />

      <section
        className="relative min-h-[76vh] bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/65" />

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

      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <p className="text-sm font-bold text-slate-950">Explore EF Enroll</p>
          <div className="flex flex-wrap gap-2">
            {pageLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:text-blue-700"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/catalog"
              className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Open Catalog
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <section id="offers" className="grid scroll-mt-24 gap-4 md:grid-cols-3">
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

        <section className="mt-8 grid scroll-mt-24 gap-4 lg:grid-cols-4">
          {courseOfferings.map((offering) => (
            <article
              key={offering.title}
              className="border border-slate-300 bg-white p-5"
            >
              <h2 className="text-lg font-bold text-slate-950">
                {offering.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {offering.text}
              </p>
            </article>
          ))}
        </section>

        <section id="courses" className="mt-8 scroll-mt-24 border border-slate-300 bg-white">
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

        <section
          id="how-it-works"
          className="mt-8 scroll-mt-24 border border-slate-300 bg-white p-5"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                How enrollment works
              </h2>
              <p className="text-sm text-slate-600">
                A simple flow for students, professors, and admins.
              </p>
            </div>
            <Link
              to="/register/student"
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Start as student
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div
                key={step}
                className="border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-3 font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="stats" className="mt-8 grid scroll-mt-24 gap-4 md:grid-cols-3">
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

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import AuthContext from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { getAuthUser } from "../utils/authStorage";

const initialFilters = {
  search: "",
  semester: "",
  professor: "",
  credits: "",
  price: "",
  status: "all",
  sortBy: "name",
};

const PublicCourses = () => {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const authUser = getAuthUser();
  const authRole = authUser?.role;
  const userInitial = authUser?.username?.charAt(0)?.toUpperCase() || "U";

  const fetchCourses = useCallback(() => {
    courseService
      .getPublicAll()
      .then((res) => setCourses(res.data))
      .catch(() => setError("Courses could not be loaded."));
  }, []);

  const fetchMyEnrollments = useCallback(() => {
    if (authRole !== "student") {
      return;
    }

    enrollmentService
      .getMine()
      .then((res) => setMyEnrollments(res.data))
      .catch(() => setMyEnrollments([]));
  }, [authRole]);

  useEffect(() => {
    fetchCourses();
    fetchMyEnrollments();
  }, [fetchCourses, fetchMyEnrollments]);

  const semesters = useMemo(
    () =>
      [...new Set(courses.map((course) => course.semester_name).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [courses]
  );

  const professors = useMemo(
    () =>
      [...new Set(courses.map((course) => course.professor_name).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [courses]
  );

  const creditOptions = useMemo(
    () =>
      [...new Set(courses.map((course) => Number(course.kredite || 0)).filter(Boolean))]
        .sort((a, b) => a - b),
    [courses]
  );

  const categoryCounts = useMemo(() => {
    return courses.reduce((lookup, course) => {
      const semester = course.semester_name || "Unassigned";
      lookup[semester] = (lookup[semester] || 0) + 1;
      return lookup;
    }, {});
  }, [courses]);

  const enrollmentByCourse = useMemo(() => {
    return myEnrollments.reduce((lookup, enrollment) => {
      lookup[Number(enrollment.course_id)] = enrollment;
      return lookup;
    }, {});
  }, [myEnrollments]);

  const filteredCourses = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return courses
      .filter((course) => {
        const enrollment = enrollmentByCourse[Number(course.id)];
        const isEnrolled = Boolean(enrollment);
        const isPaid = enrollment?.payment_status === "paid";
        const courseText = [
          course.emertimi,
          course.pershkrimi,
          course.professor_name,
          course.semester_name,
        ]
          .join(" ")
          .toLowerCase();

        if (searchTerm && !courseText.includes(searchTerm)) {
          return false;
        }

        if (filters.semester && course.semester_name !== filters.semester) {
          return false;
        }

        if (filters.professor && course.professor_name !== filters.professor) {
          return false;
        }

        if (filters.credits && Number(course.kredite || 0) !== Number(filters.credits)) {
          return false;
        }

        if (filters.price === "free" && Number(course.cmimi || 0) > 0) {
          return false;
        }

        if (filters.price === "paid" && Number(course.cmimi || 0) === 0) {
          return false;
        }

        if (authRole !== "student") {
          return true;
        }

        if (filters.status === "available" && isEnrolled) {
          return false;
        }

        if (filters.status === "enrolled" && !isEnrolled) {
          return false;
        }

        if (filters.status === "paid" && !isPaid) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "credits") {
          return Number(b.kredite || 0) - Number(a.kredite || 0);
        }

        if (filters.sortBy === "price-low") {
          return Number(a.cmimi || 0) - Number(b.cmimi || 0);
        }

        if (filters.sortBy === "price-high") {
          return Number(b.cmimi || 0) - Number(a.cmimi || 0);
        }

        return String(a.emertimi || "").localeCompare(String(b.emertimi || ""));
      });
  }, [authRole, courses, enrollmentByCourse, filters]);

  const enrolledCount = myEnrollments.length;
  const paidCount = myEnrollments.filter(
    (enrollment) => enrollment.payment_status === "paid"
  ).length;
  const availableCount = courses.length - enrolledCount;
  const activeFilterLabels = [
    filters.search && `Search: ${filters.search}`,
    filters.semester && `Semester: ${filters.semester}`,
    filters.professor && `Professor: ${filters.professor}`,
    filters.credits && `${filters.credits} credits`,
    filters.price && (filters.price === "free" ? "Free courses" : "Paid courses"),
    authRole === "student" &&
      filters.status !== "all" &&
      `Status: ${filters.status}`,
  ].filter(Boolean);
  const hasActiveFilters = activeFilterLabels.length > 0;

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const selectSemester = (semester) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      semester,
    }));
  };

  const getProfessorLabel = (course) => {
    if (!course.professor_name) {
      return "Not assigned";
    }

    return [course.titulli, course.professor_name].filter(Boolean).join(" ");
  };

  const handleEnroll = (courseId) => {
    setError("");
    setMessage("");

    if (!authUser) {
      navigate("/login");
      return;
    }

    if (authUser.role !== "student") {
      setError("Only students can enroll in courses.");
      return;
    }

    setEnrollingCourseId(courseId);

    enrollmentService
      .create(courseId)
      .then((res) => {
        setMessage(
          `${res.data.message || "Enrollment created successfully."} Continue to payment from My Enrollments.`
        );
        fetchMyEnrollments();
        navigate("/my-enrollments");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Enrollment failed.");
      })
      .finally(() => {
        setEnrollingCourseId(null);
      });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local logout still clears client state if the server is unreachable.
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f2f3f5] text-slate-900">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" className="text-xl font-bold text-slate-950">
              EF Enroll
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                to="/"
                className="rounded border border-slate-300 bg-slate-100 px-3 py-2 font-semibold text-slate-800"
              >
                Course catalog
              </Link>
              {authUser?.role === "student" && (
                <Link
                  to="/my-enrollments"
                  className="rounded border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  My courses
                </Link>
              )}
              {authUser && authUser.role !== "student" && (
                <Link
                  to="/courses"
                  className="rounded border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              {authUser ? (
                <>
                  <div className="flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-2 py-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-sm font-bold text-white">
                      {userInitial}
                    </div>
                    <div className="text-xs leading-tight">
                      <p className="font-semibold text-slate-900">
                        {authUser.username}
                      </p>
                      <p className="capitalize text-slate-500">{authUser.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Home / Courses / Course catalog
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <section className="mb-5 border border-slate-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Course enrollment platform
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Course catalog
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Browse available courses, filter by semester, professor, credits, or
            price, and continue directly to enrollment from your account.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-200 pt-4 text-sm">
            <div>
              <span className="block font-bold text-slate-950">{courses.length}</span>
              <span className="text-slate-500">Courses</span>
            </div>
            <div>
              <span className="block font-bold text-slate-950">{semesters.length}</span>
              <span className="text-slate-500">Semesters</span>
            </div>
            <div>
              <span className="block font-bold text-slate-950">{professors.length}</span>
              <span className="text-slate-500">Professors</span>
            </div>
            {authRole === "student" && (
              <div>
                <span className="block font-bold text-slate-950">
                  {enrolledCount}
                </span>
                <span className="text-slate-500">My courses</span>
              </div>
            )}
          </div>
        </section>

        {error && (
          <p className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
          <aside className="space-y-5">
            <section className="border border-slate-300 bg-white">
              <h2 className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900">
                Course categories
              </h2>
              <div className="space-y-3 p-4">
                <button
                  type="button"
                  onClick={() => selectSemester("")}
                  className={`block w-full rounded border px-3 py-2 text-left text-sm font-semibold ${
                    filters.semester
                      ? "border-slate-200 bg-white text-slate-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  All courses ({courses.length})
                </button>
                {semesters.map((semester) => (
                  <button
                    key={semester}
                    type="button"
                    onClick={() => selectSemester(semester)}
                    className={`block w-full rounded border px-3 py-2 text-left text-sm font-semibold ${
                      filters.semester === semester
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {semester} ({categoryCounts[semester] || 0})
                  </button>
                ))}
                {!semesters.length && (
                  <p className="text-sm text-slate-500">
                    No course categories yet.
                  </p>
                )}
              </div>
            </section>

            <section className="border border-slate-300 bg-white">
              <h2 className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900">
                Course filters
              </h2>
              <div className="space-y-3 p-4">
                <TextInput
                  name="search"
                  placeholder="Search courses"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="rounded border-slate-300 bg-white"
                />

                <SelectInput
                  name="professor"
                  value={filters.professor}
                  onChange={handleFilterChange}
                  className="rounded border-slate-300 bg-white"
                >
                  <option value="">All professors</option>
                  {professors.map((professor) => (
                    <option key={professor} value={professor}>
                      {professor}
                    </option>
                  ))}
                </SelectInput>

                <SelectInput
                  name="credits"
                  value={filters.credits}
                  onChange={handleFilterChange}
                  className="rounded border-slate-300 bg-white"
                >
                  <option value="">Any credits</option>
                  {creditOptions.map((credits) => (
                    <option key={credits} value={credits}>
                      {credits} credits
                    </option>
                  ))}
                </SelectInput>

                <SelectInput
                  name="price"
                  value={filters.price}
                  onChange={handleFilterChange}
                  className="rounded border-slate-300 bg-white"
                >
                  <option value="">Any price</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </SelectInput>

                {authRole === "student" && (
                  <SelectInput
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="rounded border-slate-300 bg-white"
                  >
                    <option value="all">All statuses</option>
                    <option value="available">Available</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="paid">Enrolled and paid</option>
                  </SelectInput>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset filters
                </button>
              </div>
            </section>
          </aside>

          <section className="space-y-4">
            <div className="border border-slate-300 bg-white">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Available courses
                  </h2>
                  <p className="text-sm text-slate-600">
                    Showing {filteredCourses.length} of {courses.length} courses
                  </p>
                </div>

                <SelectInput
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="max-w-xs rounded border-slate-300 bg-white"
                >
                  <option value="name">Sort by course name</option>
                  <option value="credits">Sort by credits</option>
                  <option value="price-low">Price low to high</option>
                  <option value="price-high">Price high to low</option>
                </SelectInput>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 text-xs">
                  {activeFilterLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded border border-blue-100 bg-blue-50 px-2 py-1 font-semibold text-blue-700"
                    >
                      {label}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded border border-slate-200 px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="divide-y divide-slate-200">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    const enrollment = enrollmentByCourse[Number(course.id)];
                    const isEnrolled = Boolean(enrollment);
                    const isPaid = enrollment?.payment_status === "paid";

                    return (
                      <article
                        key={course.id}
                        className="grid gap-4 bg-white p-4 hover:bg-slate-50 md:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-blue-800">
                              {course.emertimi}
                            </h3>
                            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                              {course.kredite || 0} credits
                            </span>
                            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                              {Number(course.cmimi || 0) === 0
                                ? "Free"
                                : `${Number(course.cmimi || 0).toFixed(2)} EUR`}
                            </span>
                            {isEnrolled && (
                              <span
                                className={`rounded px-2 py-1 text-xs font-semibold ${
                                  isPaid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {isPaid ? "Paid" : "Payment pending"}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {course.pershkrimi || "No description available."}
                          </p>

                          <dl className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                            <div>
                              <dt className="font-semibold text-slate-950">
                                Professor
                              </dt>
                              <dd>{getProfessorLabel(course)}</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-slate-950">
                                Semester
                              </dt>
                              <dd>{course.semester_name || "Not assigned"}</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-slate-950">
                                Credits
                              </dt>
                              <dd>{course.kredite || 0}</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-slate-950">
                                Capacity
                              </dt>
                              <dd>{course.kapaciteti || 0} seats</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-slate-950">
                                Price
                              </dt>
                              <dd>{Number(course.cmimi || 0).toFixed(2)} EUR</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="flex min-w-44 flex-col justify-center gap-2">
                          <Link
                            to={`/materials?course_id=${course.id}`}
                            className="rounded border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Course materials
                          </Link>

                          {isEnrolled ? (
                            <Link
                              to="/my-enrollments"
                              className={`rounded px-3 py-2 text-center text-sm font-semibold text-white ${
                                isPaid
                                  ? "bg-green-700 hover:bg-green-800"
                                  : "bg-blue-700 hover:bg-blue-800"
                              }`}
                            >
                              {isPaid ? "View enrollment" : "Pay now"}
                            </Link>
                          ) : (
                            <Button
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrollingCourseId === course.id}
                              className="rounded py-2"
                              fullWidth
                            >
                              {enrollingCourseId === course.id
                                ? "Enrolling..."
                                : "Enroll"}
                            </Button>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="p-8 text-sm text-slate-500">
                    No courses match the selected filters.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="border border-slate-300 bg-white">
              <h2 className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900">
                Course overview
              </h2>
              <div className="grid gap-3 p-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Filtered</span>
                  <strong>{filteredCourses.length}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Total courses</span>
                  <strong>{courses.length}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Available</span>
                  <strong>{Math.max(availableCount, 0)}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>My enrollments</span>
                  <strong>{enrolledCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Paid courses</span>
                  <strong>{paidCount}</strong>
                </div>
              </div>
            </section>

            <section className="border border-slate-300 bg-white">
              <h2 className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900">
                Account actions
              </h2>
              <div className="space-y-3 p-4 text-sm">
                {authUser ? (
                  <>
                    <p className="text-slate-600">
                      You are logged in as{" "}
                      <span className="font-semibold text-slate-900">
                        {authUser.username}
                      </span>
                      .
                    </p>
                    {authUser.role === "student" ? (
                      <Link
                        to="/my-enrollments"
                        className="block rounded bg-blue-700 px-3 py-2 text-center font-semibold text-white hover:bg-blue-800"
                      >
                        Open my courses
                      </Link>
                    ) : (
                      <Link
                        to="/courses"
                        className="block rounded bg-blue-700 px-3 py-2 text-center font-semibold text-white hover:bg-blue-800"
                      >
                        Open dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-slate-600">
                      Log in or create a student account to enroll in a course.
                    </p>
                    <Link
                      to="/login"
                      className="block rounded bg-blue-700 px-3 py-2 text-center font-semibold text-white hover:bg-blue-800"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register/student"
                      className="block rounded border border-slate-300 bg-white px-3 py-2 text-center font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Register as student
                    </Link>
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PublicCourses;

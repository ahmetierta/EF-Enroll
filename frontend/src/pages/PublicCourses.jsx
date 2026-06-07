import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicHeader from "../components/navigation/PublicHeader";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { waitingListService } from "../services/waitingListService";
import { getAuthUser } from "../utils/authStorage";
import {
  formatCoursePrice,
  getCourseImage,
  getCourseScheduleLabel,
} from "../utils/courseVisuals";

const initialFilters = {
  search: "",
  semester: "",
  professor: "",
  credits: "",
  price: "",
  status: "all",
  sortBy: "name",
};

const durationOptions = [
  { value: 1, label: "1 month" },
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
];
const firstTimeDiscountPercent = 20;

function calculateOffer(course, durationMonths, isFirstTimeStudent) {
  const baseAmount = Number(course.cmimi || 0) * Number(durationMonths || 1);
  const discountPercent = isFirstTimeStudent ? firstTimeDiscountPercent : 0;
  const discountAmount = (baseAmount * discountPercent) / 100;

  return {
    baseAmount,
    discountPercent,
    finalAmount: Math.max(baseAmount - discountAmount, 0),
  };
}

const PublicCourses = () => {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [myWaitingList, setMyWaitingList] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [selectedDurationByCourse, setSelectedDurationByCourse] = useState({});
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const authRole = authUser?.role;

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

  const fetchMyWaitingList = useCallback(() => {
    if (authRole !== "student") {
      return;
    }

    waitingListService
      .getAll()
      .then((res) => setMyWaitingList(res.data))
      .catch(() => setMyWaitingList([]));
  }, [authRole]);

  useEffect(() => {
    fetchCourses();
    fetchMyEnrollments();
    fetchMyWaitingList();
  }, [fetchCourses, fetchMyEnrollments, fetchMyWaitingList]);

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

  const waitingListByCourse = useMemo(() => {
    return myWaitingList.reduce((lookup, item) => {
      lookup[Number(item.course_id)] = item;
      return lookup;
    }, {});
  }, [myWaitingList]);

  const filteredCourses = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return courses
      .filter((course) => {
        const enrollment = enrollmentByCourse[Number(course.id)];
        const waitingListItem = waitingListByCourse[Number(course.id)];
        const isEnrolled = Boolean(enrollment);
        const isWaitlisted = Boolean(waitingListItem);
        const isPaid = enrollment?.payment_status === "paid";
        const capacity = Number(course.kapaciteti || 0);
        const isFull = capacity > 0 && Number(course.available_seats || 0) <= 0;
        const courseText = [
          course.emertimi,
          course.pershkrimi,
          course.professor_name,
          course.semester_name,
          course.schedule_summary,
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

        if (
          filters.status === "available" &&
          (isEnrolled || isWaitlisted || isFull)
        ) {
          return false;
        }

        if (filters.status === "enrolled" && !isEnrolled) {
          return false;
        }

        if (filters.status === "waitlisted" && !isWaitlisted) {
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
  }, [authRole, courses, enrollmentByCourse, filters, waitingListByCourse]);

  const enrolledCount = myEnrollments.length;
  const waitingCount = myWaitingList.length;
  const paidCount = myEnrollments.filter(
    (enrollment) => enrollment.payment_status === "paid"
  ).length;
  const isFirstTimeStudent = authRole === "student" && myEnrollments.length === 0;
  const availableCount = courses.filter((course) => {
    const capacity = Number(course.kapaciteti || 0);
    return capacity === 0 || Number(course.available_seats || 0) > 0;
  }).length;
  const hasActiveFilters = [
    filters.search,
    filters.semester,
    filters.professor,
    filters.credits,
    filters.price,
    authRole === "student" && filters.status !== "all",
  ].some(Boolean);

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

  const getSelectedDuration = (courseId) =>
    Number(selectedDurationByCourse[courseId] || 1);

  const handleDurationChange = (courseId, durationMonths) => {
    setSelectedDurationByCourse((currentDurations) => ({
      ...currentDurations,
      [courseId]: Number(durationMonths),
    }));
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
      .create(courseId, getSelectedDuration(courseId))
      .then((res) => {
        setMessage(
          res.data.message || "Enrollment request completed successfully."
        );
        fetchCourses();
        fetchMyEnrollments();
        fetchMyWaitingList();

        if (res.status === 202 || res.data.waiting_list_id) {
          navigate("/waiting-list");
          return;
        }

        navigate("/my-enrollments");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Enrollment failed.");
      })
      .finally(() => {
        setEnrollingCourseId(null);
      });
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <PublicHeader activePage="catalog" />

      <main>
        <section
          className="relative overflow-hidden bg-slate-950 text-white"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(15,23,42,0.74)), url(${getCourseImage(
              { id: 4 },
              4
            )})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Course catalog
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white lg:text-5xl">
                Find the course that fits your schedule
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 lg:text-base">
                Compare courses by professor, price, schedule and available
                seats, then choose the duration before enrollment.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Courses", courses.length],
                ["Available", availableCount],
                ["Professors", professors.length],
                ["My courses", enrolledCount],
                ["Waiting list", waitingCount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border border-white/20 bg-white/10 px-4 py-3 backdrop-blur"
                >
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.3fr)_repeat(4,minmax(140px,1fr))_160px]">
              <TextInput
                name="search"
                placeholder="Search courses, professors, schedules"
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

              <SelectInput
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="rounded border-slate-300 bg-white"
              >
                <option value="name">Name</option>
                <option value="credits">Credits</option>
                <option value="price-low">Price low</option>
                <option value="price-high">Price high</option>
              </SelectInput>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Reset
              </button>
            </div>

            {authRole === "student" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {["all", "available", "enrolled", "waitlisted", "paid"].map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setFilters((currentFilters) => ({
                          ...currentFilters,
                          status,
                        }))
                      }
                      className={`rounded border px-3 py-2 text-xs font-semibold capitalize ${
                        filters.status === status
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status === "paid" ? "paid courses" : status}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-bold text-slate-950">Semesters</h2>
              </div>
              <div className="space-y-2 p-3">
                <button
                  type="button"
                  onClick={() => selectSemester("")}
                  className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-semibold ${
                    filters.semester
                      ? "bg-white text-slate-700 hover:bg-slate-50"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <span>All courses</span>
                  <span>{courses.length}</span>
                </button>
                {semesters.map((semester) => (
                  <button
                    key={semester}
                    type="button"
                    onClick={() => selectSemester(semester)}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-semibold ${
                      filters.semester === semester
                        ? "bg-blue-50 text-blue-700"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{semester}</span>
                    <span>{categoryCounts[semester] || 0}</span>
                  </button>
                ))}
              </div>
            </section>

            {isFirstTimeStudent && (
              <section className="border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-800">
                  First-time offer
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  Your first enrollment gets {firstTimeDiscountPercent}% off.
                </p>
              </section>
            )}

            <section className="border border-slate-200 bg-white p-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Showing</span>
                <strong>{filteredCourses.length}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span>Paid</span>
                <strong>{paidCount}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span>Filters</span>
                <strong>{hasActiveFilters ? "Active" : "Clear"}</strong>
              </div>
            </section>
          </aside>

          <section className="space-y-4">
            {error && (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Available courses
                </h2>
                <p className="text-sm text-slate-600">
                  Showing {filteredCourses.length} of {courses.length} courses
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => {
                  const enrollment = enrollmentByCourse[Number(course.id)];
                  const waitingListItem = waitingListByCourse[Number(course.id)];
                  const isEnrolled = Boolean(enrollment);
                  const isWaitlisted = Boolean(waitingListItem);
                  const isPaid = enrollment?.payment_status === "paid";
                  const capacity = Number(course.kapaciteti || 0);
                  const availableSeats = Number(course.available_seats || 0);
                  const isFull = capacity > 0 && availableSeats <= 0;
                  const selectedDuration = getSelectedDuration(course.id);
                  const offer = calculateOffer(
                    course,
                    selectedDuration,
                    isFirstTimeStudent
                  );

                  return (
                    <article
                      key={course.id}
                      className="overflow-hidden border border-slate-200 bg-white shadow-sm"
                    >
                      <Link to={`/catalog/${course.id}`} className="block">
                        <img
                          src={getCourseImage(course, index)}
                          alt=""
                          className="h-44 w-full object-cover"
                        />
                      </Link>

                      <div className="space-y-4 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <Link
                              to={`/catalog/${course.id}`}
                              className="text-xl font-bold text-slate-950 hover:text-blue-700"
                            >
                              {course.emertimi}
                            </Link>
                            <p className="mt-1 text-sm text-slate-600">
                              {getProfessorLabel(course)}
                            </p>
                          </div>
                          <span className="rounded bg-slate-950 px-3 py-1 text-sm font-bold text-white">
                            {formatCoursePrice(course)}
                          </span>
                        </div>

                        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                          {course.pershkrimi || "No description available."}
                        </p>

                        <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Schedule
                            </span>
                            <span className="font-semibold text-slate-900">
                              {getCourseScheduleLabel(course)}
                            </span>
                          </div>
                          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Seats
                            </span>
                            <span className="font-semibold text-slate-900">
                              {availableSeats} / {capacity || 0} available
                            </span>
                          </div>
                          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Credits
                            </span>
                            <span className="font-semibold text-slate-900">
                              {course.kredite || 0} credits
                            </span>
                          </div>
                          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Semester
                            </span>
                            <span className="font-semibold text-slate-900">
                              {course.semester_name || "Not assigned"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {isEnrolled && (
                            <span
                              className={`rounded px-2 py-1 text-xs font-bold ${
                                isPaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {isPaid ? "Paid" : "Payment pending"}
                            </span>
                          )}
                          {isWaitlisted && (
                            <span className="rounded bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                              Waiting list #{waitingListItem.pozicioni}
                            </span>
                          )}
                          {isFull && !isWaitlisted && !isEnrolled && (
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                              Full course
                            </span>
                          )}
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                          {isEnrolled ? (
                            <div className="grid gap-2 sm:grid-cols-3">
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
                              <Link
                                to={`/catalog/${course.id}`}
                                className="rounded border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Details
                              </Link>
                              <Link
                                to={`/materials?course_id=${course.id}`}
                                className="rounded border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Materials
                              </Link>
                            </div>
                          ) : isWaitlisted ? (
                            <div className="grid gap-2 sm:grid-cols-3">
                              <Link
                                to="/waiting-list"
                                className="rounded bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-orange-700"
                              >
                                Waiting list
                              </Link>
                              <Link
                                to={`/catalog/${course.id}`}
                                className="rounded border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Details
                              </Link>
                              <Link
                                to={`/materials?course_id=${course.id}`}
                                className="rounded border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Materials
                              </Link>
                            </div>
                          ) : (
                            <div className="grid gap-3 lg:grid-cols-[130px_minmax(0,1fr)_140px]">
                              <SelectInput
                                value={selectedDuration}
                                onChange={(e) =>
                                  handleDurationChange(course.id, e.target.value)
                                }
                                className="rounded border-slate-300 bg-white text-sm"
                              >
                                {durationOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </SelectInput>

                              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                                <p className="font-bold text-slate-950">
                                  {offer.finalAmount.toFixed(2)} EUR total
                                </p>
                                {isFirstTimeStudent && (
                                  <p className="mt-1 text-emerald-700">
                                    {offer.discountPercent}% first-time discount
                                  </p>
                                )}
                              </div>

                              <Button
                                onClick={() => handleEnroll(course.id)}
                                disabled={enrollingCourseId === course.id}
                                className="rounded py-2"
                                fullWidth
                              >
                                {enrollingCourseId === course.id
                                  ? "Enrolling..."
                                  : isFull
                                    ? "Join list"
                                    : "Enroll"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="border border-slate-200 bg-white p-8 text-sm text-slate-500 xl:col-span-2">
                  No courses match the selected filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PublicCourses;

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import AuthContext from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { materialService } from "../services/materialService";
import { waitingListService } from "../services/waitingListService";
import { getAuthUser } from "../utils/authStorage";
import {
  formatCoursePrice,
  getCourseImage,
  getCourseScheduleLabel,
} from "../utils/courseVisuals";

const durationOptions = [
  { value: 1, label: "1 month" },
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
];
const firstTimeDiscountPercent = 20;

function calculateOffer(course, durationMonths, isFirstTimeStudent) {
  const baseAmount = Number(course?.cmimi || 0) * Number(durationMonths || 1);
  const discountPercent = isFirstTimeStudent ? firstTimeDiscountPercent : 0;
  const discountAmount = (baseAmount * discountPercent) / 100;

  return {
    baseAmount,
    discountPercent,
    finalAmount: Math.max(baseAmount - discountAmount, 0),
  };
}

function getMaterialTypeLabel(type) {
  const labels = {
    video: "Video",
    reading: "Reading",
    slides: "Slides",
    assignment: "Assignment",
    quiz: "Quiz",
    resource: "Resource",
    link: "Link",
  };

  return labels[type] || "Resource";
}

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const authUser = getAuthUser();
  const authRole = authUser?.role;
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [myWaitingList, setMyWaitingList] = useState([]);
  const [durationMonths, setDurationMonths] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCourse = useCallback(() => {
    courseService
      .getPublicById(id)
      .then((res) => setCourse(res.data?.[0] || null))
      .catch(() => setError("Course could not be loaded."))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchStudentContext = useCallback(() => {
    if (authRole !== "student") {
      return;
    }

    enrollmentService
      .getMine()
      .then((res) => setMyEnrollments(res.data))
      .catch(() => setMyEnrollments([]));

    waitingListService
      .getAll()
      .then((res) => setMyWaitingList(res.data))
      .catch(() => setMyWaitingList([]));
  }, [authRole]);

  const fetchMaterials = useCallback(() => {
    if (!authRole) {
      return;
    }

    materialService
      .getAll({ course_id: id })
      .then((res) => setMaterials(res.data.slice(0, 4)))
      .catch(() => setMaterials([]));
  }, [authRole, id]);

  useEffect(() => {
    fetchCourse();
    fetchStudentContext();
    fetchMaterials();
  }, [fetchCourse, fetchMaterials, fetchStudentContext]);

  const enrollment = useMemo(
    () =>
      myEnrollments.find(
        (item) => Number(item.course_id) === Number(course?.id)
      ),
    [course?.id, myEnrollments]
  );
  const waitingListItem = useMemo(
    () =>
      myWaitingList.find((item) => Number(item.course_id) === Number(course?.id)),
    [course?.id, myWaitingList]
  );
  const isEnrolled = Boolean(enrollment);
  const isWaitlisted = Boolean(waitingListItem);
  const isFirstTimeStudent = authRole === "student" && myEnrollments.length === 0;
  const offer = calculateOffer(course, durationMonths, isFirstTimeStudent);
  const capacity = Number(course?.kapaciteti || 0);
  const availableSeats = Number(course?.available_seats || 0);
  const isFull = capacity > 0 && availableSeats <= 0;

  const handleEnroll = () => {
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

    setProcessing(true);

    enrollmentService
      .create(course.id, durationMonths)
      .then((res) => {
        setMessage(res.data.message || "Enrollment completed successfully.");
        fetchCourse();
        fetchStudentContext();

        if (res.status === 202 || res.data.waiting_list_id) {
          navigate("/waiting-list");
        } else {
          navigate("/my-enrollments");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Enrollment failed.");
      })
      .finally(() => setProcessing(false));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local logout still clears client state if the server is unreachable.
    }

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f3f5] p-8 text-slate-700">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f2f3f5] p-8 text-slate-700">
        Course was not found.
      </div>
    );
  }

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
                className="rounded border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Home
              </Link>
              <Link
                to="/catalog"
                className="rounded border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Catalog
              </Link>
              {authUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded bg-blue-700 px-3 py-2 font-semibold text-white hover:bg-blue-800"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <Link to="/" className="font-semibold text-slate-700 hover:text-blue-700">
              Home
            </Link>{" "}
            /{" "}
            <Link
              to="/catalog"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Catalog
            </Link>{" "}
            / {course.emertimi}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
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

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="border border-slate-300 bg-white">
            <img
              src={getCourseImage(course)}
              alt=""
              className="h-72 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {course.kredite || 0} credits
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                  {formatCoursePrice(course)}
                </span>
                {isEnrolled && (
                  <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    Enrolled
                  </span>
                )}
                {isWaitlisted && (
                  <span className="rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                    Waiting list #{waitingListItem.pozicioni}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-4xl font-bold text-slate-950">
                {course.emertimi}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                {course.pershkrimi || "No description available."}
              </p>

              <dl className="mt-6 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                <div className="border border-slate-200 bg-slate-50 p-4">
                  <dt className="font-semibold text-slate-950">Professor</dt>
                  <dd className="mt-1">
                    {[course.titulli, course.professor_name]
                      .filter(Boolean)
                      .join(" ") || "Not assigned"}
                  </dd>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-4">
                  <dt className="font-semibold text-slate-950">Semester</dt>
                  <dd className="mt-1">{course.semester_name || "Not assigned"}</dd>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-4">
                  <dt className="font-semibold text-slate-950">Schedule</dt>
                  <dd className="mt-1">{getCourseScheduleLabel(course)}</dd>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-4">
                  <dt className="font-semibold text-slate-950">Seats</dt>
                  <dd className="mt-1">
                    {availableSeats} of {capacity || 0} available
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className="space-y-5">
            <section className="border border-slate-300 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-950">
                Enrollment Options
              </h2>

              {!isEnrolled && !isWaitlisted && (
                <div className="mt-4 space-y-3">
                  <SelectInput
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="rounded border-slate-300 bg-white text-sm"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>

                  <div className="rounded border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                    <p className="font-bold text-slate-950">
                      {offer.finalAmount.toFixed(2)} EUR total
                    </p>
                    {offer.discountPercent > 0 && (
                      <>
                        <p className="mt-1 text-green-700">
                          First-time offer: {offer.discountPercent}% off
                        </p>
                        <p className="mt-1 text-slate-500">
                          Before discount: {offer.baseAmount.toFixed(2)} EUR
                        </p>
                      </>
                    )}
                  </div>

                  <Button onClick={handleEnroll} disabled={processing} fullWidth>
                    {processing
                      ? "Processing..."
                      : isFull
                        ? "Join waiting list"
                        : "Enroll now"}
                  </Button>
                </div>
              )}

              {isEnrolled && (
                <Link
                  to="/my-enrollments"
                  className="mt-4 block rounded bg-blue-700 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Open my enrollment
                </Link>
              )}

              {isWaitlisted && (
                <Link
                  to="/waiting-list"
                  className="mt-4 block rounded bg-orange-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-orange-700"
                >
                  View waiting list status
                </Link>
              )}
            </section>

            <section className="border border-slate-300 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-950">
                Course Materials
              </h2>
              {materials.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="border border-slate-200 bg-slate-50 p-3 text-sm"
                    >
                      <p className="font-semibold text-slate-950">
                        {material.titulli}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {getMaterialTypeLabel(material.material_type)}
                        {material.is_required ? " - Required" : " - Optional"}
                      </p>
                    </div>
                  ))}
                  <Link
                    to={`/materials?course_id=${course.id}`}
                    className="block rounded border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Open materials
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Materials are visible after login and enrollment when the
                  professor publishes them.
                </p>
              )}
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default CourseDetails;

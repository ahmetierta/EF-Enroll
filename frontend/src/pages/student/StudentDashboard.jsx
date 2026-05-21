import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import TableCard from "../../components/layout/TableCard";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { waitingListService } from "../../services/waitingListService";
import { formatCoursePrice, getCourseImage } from "../../utils/courseVisuals";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(() => {
    Promise.all([
      courseService.getPublicAll(),
      enrollmentService.getMine(),
      waitingListService.getAll(),
    ])
      .then(([coursesRes, enrollmentsRes, waitingRes]) => {
        setCourses(coursesRes.data);
        setEnrollments(enrollmentsRes.data);
        setWaitingList(waitingRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Dashboard could not be loaded.");
      });
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const unpaidEnrollments = useMemo(
    () => enrollments.filter((item) => item.payment_status !== "paid"),
    [enrollments]
  );
  const paidEnrollments = useMemo(
    () => enrollments.filter((item) => item.payment_status === "paid"),
    [enrollments]
  );
  const recommendedCourses = useMemo(() => {
    const blockedCourseIds = new Set([
      ...enrollments.map((item) => Number(item.course_id)),
      ...waitingList.map((item) => Number(item.course_id)),
    ]);

    return courses
      .filter((course) => !blockedCourseIds.has(Number(course.id)))
      .slice(0, 3);
  }, [courses, enrollments, waitingList]);

  return (
    <PageContainer title="Student Dashboard">
      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">My Courses</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {enrollments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {paidEnrollments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Unpaid</p>
          <p className="mt-2 text-3xl font-bold text-orange-700">
            {unpaidEnrollments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Waiting List</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {waitingList.length}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <TableCard title="Next Actions">
          <div className="grid gap-3 text-sm">
            <Link
              to="/catalog"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse more courses
            </Link>
            <Link
              to="/my-enrollments"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open my enrollments ({enrollments.length})
            </Link>
            <Link
              to="/waiting-list"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Check waiting list ({waitingList.length})
            </Link>
            <Link
              to="/materials"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open course materials
            </Link>
          </div>
        </TableCard>

        <TableCard title="Payment Attention">
          <div className="space-y-3">
            {unpaidEnrollments.slice(0, 4).map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {enrollment.course_name}
                </p>
                <p className="mt-1 text-slate-500">
                  {Number(
                    enrollment.final_amount || enrollment.cmimi || 0
                  ).toFixed(2)}{" "}
                  EUR due
                </p>
              </div>
            ))}
            {!unpaidEnrollments.length && (
              <p className="text-sm text-slate-500">No unpaid enrollments.</p>
            )}
          </div>
        </TableCard>

        <TableCard title="Recommended Courses">
          <div className="space-y-3">
            {recommendedCourses.map((course) => (
              <Link
                key={course.id}
                to={`/catalog/${course.id}`}
                className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm hover:bg-slate-50"
              >
                <img
                  src={getCourseImage(course)}
                  alt=""
                  className="h-16 w-full rounded object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">{course.emertimi}</p>
                  <p className="mt-1 text-slate-500">{formatCoursePrice(course)}</p>
                </div>
              </Link>
            ))}
            {!recommendedCourses.length && (
              <p className="text-sm text-slate-500">
                No recommendations available yet.
              </p>
            )}
          </div>
        </TableCard>
      </div>
    </PageContainer>
  );
};

export default StudentDashboard;

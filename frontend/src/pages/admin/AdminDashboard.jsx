import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import TableCard from "../../components/layout/TableCard";
import { adminService } from "../../services/adminService";
import { courseService } from "../../services/courseService";
import { professorService } from "../../services/professorService";
import { studentService } from "../../services/studentService";
import { waitingListService } from "../../services/waitingListService";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [pendingProfessors, setPendingProfessors] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(() => {
    Promise.all([
      courseService.getAll(),
      studentService.getAll(),
      professorService.getAll(),
      adminService.getPendingProfessors(),
      waitingListService.getAll(),
      adminService.getDashboardSummary(),
    ])
      .then(([coursesRes, studentsRes, professorsRes, pendingRes, waitingRes, summaryRes]) => {
        setCourses(coursesRes.data);
        setStudents(studentsRes.data);
        setProfessors(professorsRes.data);
        setPendingProfessors(pendingRes.data);
        setWaitingList(waitingRes.data);
        setSummary(summaryRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Dashboard could not be loaded.");
      });
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const scheduledCourses = useMemo(
    () => courses.filter((course) => course.schedules?.length).length,
    [courses]
  );
  const readyWaitingList = useMemo(
    () => waitingList.filter((item) => Number(item.available_seats || 0) > 0).length,
    [waitingList]
  );
  const totals = summary?.totals || {};
  const summaryCards = [
    {
      label: "Students",
      value: totals.students ?? students.length,
      color: "text-slate-900",
    },
    {
      label: "Professors",
      value: totals.professors ?? professors.length,
      color: "text-blue-700",
    },
    {
      label: "Courses",
      value: totals.courses ?? courses.length,
      color: "text-slate-900",
    },
    {
      label: "Scheduled",
      value: totals.scheduled_courses ?? scheduledCourses,
      color: "text-emerald-700",
    },
    {
      label: "Unpaid",
      value: totals.unpaid_enrollments ?? 0,
      color: "text-orange-700",
    },
    {
      label: "Revenue",
      value: `${Number(totals.total_revenue || 0).toFixed(0)} EUR`,
      color: "text-green-700",
    },
  ];

  return (
    <PageContainer title="Admin Dashboard">
      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <TableCard title="Quick Actions">
          <div className="grid gap-3 text-sm">
            <Link
              to="/admin/approvals"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Review professor approvals (
              {totals.pending_professors ?? pendingProfessors.length})
            </Link>
            <Link
              to="/courses"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage courses
            </Link>
            <Link
              to="/waiting-list"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Waiting list ready to promote ({readyWaitingList})
            </Link>
            <Link
              to="/revenue"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open revenue report
            </Link>
          </div>
        </TableCard>

        <TableCard title="Top Courses">
          <div className="space-y-3">
            {(summary?.top_courses || []).map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {course.course_name}
                </p>
                <p className="mt-1 text-slate-500">
                  {course.enrollments_count} enrollments -{" "}
                  {Number(course.revenue || 0).toFixed(2)} EUR
                </p>
              </div>
            ))}
            {!summary?.top_courses?.length && (
              <p className="text-sm text-slate-500">No course activity yet.</p>
            )}
          </div>
        </TableCard>

        <TableCard title="Courses Near Capacity">
          <div className="space-y-3">
            {(summary?.courses_near_capacity || []).map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {course.course_name}
                </p>
                <p className="mt-1 text-slate-500">
                  {course.active_enrollments} enrolled -{" "}
                  {course.available_seats} seats available
                </p>
              </div>
            ))}
            {!summary?.courses_near_capacity?.length && (
              <p className="text-sm text-slate-500">
                No courses are near capacity.
              </p>
            )}
          </div>
        </TableCard>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <TableCard title="Recent Payments">
          <div className="space-y-3">
            {(summary?.recent_payments || []).map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {payment.student_name} - {payment.course_name}
                </p>
                <p className="mt-1 text-slate-500">
                  {Number(payment.amount || 0).toFixed(2)} EUR -{" "}
                  {payment.payment_method} - {payment.statusi}
                </p>
              </div>
            ))}
            {!summary?.recent_payments?.length && (
              <p className="text-sm text-slate-500">No payments yet.</p>
            )}
          </div>
        </TableCard>

        <TableCard title="Waiting List">
          <div className="space-y-3">
            {waitingList.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  #{item.pozicioni} {item.course_name}
                </p>
                <p className="mt-1 text-slate-500">
                  {item.student_name} - {item.available_seats} seats available
                </p>
              </div>
            ))}
            {!waitingList.length && (
              <p className="text-sm text-slate-500">No waiting list entries.</p>
            )}
          </div>
        </TableCard>
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;

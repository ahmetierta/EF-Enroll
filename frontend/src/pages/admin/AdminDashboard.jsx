import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import TableCard from "../../components/layout/TableCard";
import { adminService } from "../../services/adminService";
import { courseService } from "../../services/courseService";
import { paymentService } from "../../services/paymentService";
import { professorService } from "../../services/professorService";
import { studentService } from "../../services/studentService";
import { waitingListService } from "../../services/waitingListService";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [pendingProfessors, setPendingProfessors] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(() => {
    Promise.all([
      courseService.getAll(),
      studentService.getAll(),
      professorService.getAll(),
      adminService.getPendingProfessors(),
      waitingListService.getAll(),
      paymentService.getRevenueSummary(),
    ])
      .then(([coursesRes, studentsRes, professorsRes, pendingRes, waitingRes, revenueRes]) => {
        setCourses(coursesRes.data);
        setStudents(studentsRes.data);
        setProfessors(professorsRes.data);
        setPendingProfessors(pendingRes.data);
        setWaitingList(waitingRes.data);
        setRevenue(revenueRes.data);
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

  return (
    <PageContainer title="Admin Dashboard">
      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Students</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {students.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Professors</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {professors.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Courses</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {courses.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Scheduled</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {scheduledCourses}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approvals</p>
          <p className="mt-2 text-3xl font-bold text-orange-700">
            {pendingProfessors.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {Number(revenue?.total_revenue || 0).toFixed(0)} EUR
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <TableCard title="Quick Actions">
          <div className="grid gap-3 text-sm">
            <Link
              to="/admin/approvals"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Review professor approvals ({pendingProfessors.length})
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

        <TableCard title="Recent Courses">
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{course.emertimi}</p>
                <p className="mt-1 text-slate-500">
                  {course.professor_name || "No professor"} -{" "}
                  {Number(course.cmimi || 0).toFixed(2)} EUR
                </p>
              </div>
            ))}
            {!courses.length && <p className="text-sm text-slate-500">No courses yet.</p>}
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

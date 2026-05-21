import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import TableCard from "../../components/layout/TableCard";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { materialService } from "../../services/materialService";
import { studentService } from "../../services/studentService";
import { waitingListService } from "../../services/waitingListService";

const ProfessorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(() => {
    Promise.all([
      courseService.getAll(),
      studentService.getAll(),
      enrollmentService.getAll(),
      materialService.getAll(),
      waitingListService.getAll(),
    ])
      .then(([coursesRes, studentsRes, enrollmentsRes, materialsRes, waitingRes]) => {
        setCourses(coursesRes.data);
        setStudents(studentsRes.data);
        setEnrollments(enrollmentsRes.data);
        setMaterials(materialsRes.data);
        setWaitingList(waitingRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Dashboard could not be loaded.");
      });
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const activeEnrollments = useMemo(
    () => enrollments.filter((item) => item.statusi === "active").length,
    [enrollments]
  );
  const readyWaitingList = useMemo(
    () => waitingList.filter((item) => Number(item.available_seats || 0) > 0).length,
    [waitingList]
  );

  return (
    <PageContainer title="Professor Dashboard">
      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">My Courses</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {courses.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Students</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {students.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Enrollments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeEnrollments}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Materials</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {materials.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ready Queue</p>
          <p className="mt-2 text-3xl font-bold text-orange-700">
            {readyWaitingList}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <TableCard title="Teaching Actions">
          <div className="grid gap-3 text-sm">
            <Link
              to="/materials"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Add course materials
            </Link>
            <Link
              to="/announcements"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Publish announcement
            </Link>
            <Link
              to="/enrollments"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Review enrolled students
            </Link>
            <Link
              to="/waiting-list"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage waiting list
            </Link>
          </div>
        </TableCard>

        <TableCard title="My Courses">
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{course.emertimi}</p>
                <p className="mt-1 text-slate-500">
                  {course.available_seats} seats available -{" "}
                  {course.schedules?.length || 0} schedule(s)
                </p>
              </div>
            ))}
            {!courses.length && <p className="text-sm text-slate-500">No courses yet.</p>}
          </div>
        </TableCard>

        <TableCard title="Queue Attention">
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
                  {item.student_name} - {item.statusi} - {item.prioriteti}
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

export default ProfessorDashboard;

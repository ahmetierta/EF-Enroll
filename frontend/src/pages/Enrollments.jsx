import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import { enrollmentService } from "../services/enrollmentService";
import { getAuthUser } from "../utils/authStorage";

const Enrollments = () => {
  const authUser = getAuthUser();
  const isProfessor = authUser?.role === "professor";
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");

  function fetchEnrollments() {
    enrollmentService
      .getAll()
      .then((res) => setEnrollments(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Enrollments could not be loaded.");
      });
  }

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.statusi === "active"
  ).length;
  const uniqueStudents = new Set(
    enrollments.map((enrollment) => enrollment.student_id)
  ).size;

  return (
    <PageContainer title={isProfessor ? "Course Enrollments" : "Enrollments"}>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            {isProfessor ? "Your Course Enrollments" : "Total Enrollments"}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {enrollments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {activeEnrollments}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Students</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {uniqueStudents}
          </p>
        </div>
      </div>

      <TableCard
        title={isProfessor ? "Students Enrolled in Your Courses" : "Enrollment List"}
      >
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-blue-700">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Final Price</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Grade</th>
            </tr>
          </thead>

          <tbody>
            {enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">{enrollment.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {enrollment.student_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {enrollment.numri_studentit || "No student number"}
                    </div>
                  </td>
                  <td className="px-4 py-3">{enrollment.student_email}</td>
                  <td className="px-4 py-3">{enrollment.course_name}</td>
                  <td className="px-4 py-3">
                    {enrollment.duration_months || 1} month(s)
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {Number(enrollment.final_amount || 0).toFixed(2)} EUR
                    </div>
                    {Number(enrollment.discount_percent || 0) > 0 && (
                      <div className="text-xs font-semibold text-green-700">
                        {Number(enrollment.discount_percent || 0).toFixed(0)}% off
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {enrollment.data_regjistrimit
                      ? new Date(enrollment.data_regjistrimit).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {enrollment.statusi || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{enrollment.nota || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan="9">
                  No enrollments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </PageContainer>
  );
};

export default Enrollments;

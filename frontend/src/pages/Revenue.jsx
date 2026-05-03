import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import { paymentService } from "../services/paymentService";

const Revenue = () => {
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_payments: 0,
    by_course: [],
  });
  const [error, setError] = useState("");

  function fetchRevenue() {
    paymentService
      .getRevenueSummary()
      .then((res) => setSummary(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Revenue summary could not be loaded.");
      });
  }

  useEffect(() => {
    fetchRevenue();
  }, []);

  return (
    <PageContainer title="Revenue">
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {Number(summary.total_revenue || 0).toFixed(2)} EUR
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid Payments</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {summary.total_payments || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Courses With Revenue</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.by_course?.length || 0}
          </p>
        </div>
      </div>

      <TableCard title="Revenue By Course">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-blue-700">
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Payments</th>
              <th className="px-4 py-3">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {summary.by_course?.length > 0 ? (
              summary.by_course.map((course) => (
                <tr
                  key={course.course_id}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {course.course_name}
                  </td>
                  <td className="px-4 py-3">{course.payments_count}</td>
                  <td className="px-4 py-3">
                    {Number(course.revenue || 0).toFixed(2)} EUR
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan="3">
                  No revenue recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </PageContainer>
  );
};

export default Revenue;

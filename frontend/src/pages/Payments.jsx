import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import { paymentService } from "../services/paymentService";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  function fetchPayments() {
    paymentService
      .getAll()
      .then((res) => setPayments(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Payments could not be loaded.");
      });
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );
  const paidPayments = payments.filter((payment) => payment.statusi === "paid").length;

  return (
    <PageContainer title="Payments">
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {totalRevenue.toFixed(2)} EUR
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Payments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {payments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {paidPayments}
          </p>
        </div>
      </div>

      <TableCard title="Payment List">
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
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">{payment.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {payment.student_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {payment.student_email}
                    </div>
                  </td>
                  <td className="px-4 py-3">{payment.course_name}</td>
                  <td className="px-4 py-3">
                    {Number(payment.amount || 0).toFixed(2)} EUR
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {payment.statusi}
                    </span>
                  </td>
                  <td className="px-4 py-3">{payment.payment_method}</td>
                  <td className="px-4 py-3">
                    {payment.data_pageses
                      ? new Date(payment.data_pageses).toLocaleDateString()
                      : "Not set"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan="7">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </PageContainer>
  );
};

export default Payments;

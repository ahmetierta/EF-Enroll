import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import { paymentService } from "../services/paymentService";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [confirmRefundId, setConfirmRefundId] = useState(null);

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
    (sum, payment) =>
      payment.statusi === "paid" ? sum + Number(payment.amount || 0) : sum,
    0
  );
  const paidPayments = payments.filter((payment) => payment.statusi === "paid").length;
  const refundedPayments = payments.filter(
    (payment) => payment.statusi === "refunded"
  ).length;

  const refundPayment = (paymentId) => {
    setError("");
    setMessage("");

    if (confirmRefundId !== paymentId) {
      setConfirmRefundId(paymentId);
      setMessage("Click Refund again to confirm.");
      return;
    }

    setProcessingId(paymentId);

    paymentService
      .refund(paymentId, "Refunded from admin dashboard")
      .then((res) => {
        setConfirmRefundId(null);
        setMessage(res.data.message || "Payment refunded successfully.");
        fetchPayments();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Refund failed.");
      })
      .finally(() => setProcessingId(null));
  };

  return (
    <PageContainer title="Payments">
      <div className="mb-8 grid gap-4 md:grid-cols-4">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Refunded</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {refundedPayments}
          </p>
        </div>
      </div>

      <TableCard title="Payment List">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-blue-700">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
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
                      {payment.invoice_number || "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {payment.transaction_id || "No transaction"}
                    </div>
                  </td>
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
                    {payment.duration_months || 1} month(s)
                  </td>
                  <td className="px-4 py-3">
                    <div>{Number(payment.amount || 0).toFixed(2)} EUR</div>
                    {Number(payment.discount_percent || 0) > 0 && (
                      <div className="text-xs font-semibold text-green-700">
                        {Number(payment.discount_percent || 0).toFixed(0)}% off
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        payment.statusi === "refunded"
                          ? "bg-red-50 text-red-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {payment.statusi}
                    </span>
                  </td>
                  <td className="px-4 py-3">{payment.payment_method}</td>
                  <td className="px-4 py-3">
                    {payment.data_pageses
                      ? new Date(payment.data_pageses).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => refundPayment(payment.id)}
                      disabled={
                        processingId === payment.id ||
                        payment.statusi === "refunded"
                      }
                      className="px-3 py-2 text-sm"
                      variant="secondary"
                    >
                      {confirmRefundId === payment.id ? "Confirm" : "Refund"}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan="10">
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import { enrollmentService } from "../services/enrollmentService";
import { paymentService } from "../services/paymentService";

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [payingEnrollmentId, setPayingEnrollmentId] = useState(null);
  const [paymentMethodByEnrollment, setPaymentMethodByEnrollment] = useState({});

  function fetchEnrollments() {
    enrollmentService
      .getMine()
      .then((res) => setEnrollments(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Your enrollments could not be loaded.");
      });
  }

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const payEnrollment = (enrollmentId) => {
    setError("");
    setMessage("");
    setPayingEnrollmentId(enrollmentId);

    const paymentMethod = paymentMethodByEnrollment[enrollmentId] || "simulated";

    paymentService
      .create(enrollmentId, { payment_method: paymentMethod })
      .then((res) => {
        setMessage(
          `${res.data.message} Invoice: ${res.data.invoice_number}. Amount: ${Number(
            res.data.amount || 0
          ).toFixed(2)} ${res.data.currency || "EUR"}`
        );
        fetchEnrollments();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Payment failed.");
      })
      .finally(() => {
        setPayingEnrollmentId(null);
      });
  };

  return (
    <PageContainer title="My Enrollments">
      <div className="mb-6">
        <Link
          to="/catalog"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Browse Courses
        </Link>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {enrollments.length > 0 ? (
          enrollments.map((enrollment) => {
            const isPaid = enrollment.payment_status === "paid";

            return (
              <article
                key={enrollment.id}
                className="flex min-h-64 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {enrollment.course_name}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isPaid
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm text-slate-700">
                    <div>
                      <dt className="font-semibold text-slate-950">Professor</dt>
                      <dd>{enrollment.professor_name || "Not assigned"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-950">Credits</dt>
                      <dd>{enrollment.kredite || 0}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-950">Duration</dt>
                      <dd>{enrollment.duration_months || 1} month(s)</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-950">Monthly price</dt>
                      <dd>{Number(enrollment.cmimi || 0).toFixed(2)} EUR</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-950">Total price</dt>
                      <dd>
                        {Number(enrollment.final_amount || enrollment.cmimi || 0).toFixed(2)} EUR
                      </dd>
                    </div>
                    {Number(enrollment.discount_percent || 0) > 0 && (
                      <div>
                        <dt className="font-semibold text-slate-950">Offer</dt>
                        <dd>
                          {Number(enrollment.discount_percent || 0).toFixed(0)}%
                          first-time discount
                        </dd>
                      </div>
                    )}
                    {Number(enrollment.base_amount || 0) >
                      Number(enrollment.final_amount || 0) && (
                      <div>
                        <dt className="font-semibold text-slate-950">Before discount</dt>
                        <dd>
                          {Number(enrollment.base_amount || 0).toFixed(2)} EUR
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-semibold text-slate-950">Paid amount</dt>
                      <dd>
                        {isPaid
                          ? `${Number(enrollment.paid_amount || 0).toFixed(2)} EUR`
                          : "Not paid yet"}
                      </dd>
                    </div>
                    {isPaid && (
                      <div>
                        <dt className="font-semibold text-slate-950">Payment</dt>
                        <dd>
                          {enrollment.payment_id
                            ? `${enrollment.invoice_number || `Receipt #${enrollment.payment_id}`} - ${
                                enrollment.payment_method || "paid"
                              }`
                            : "Payment recorded"}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-semibold text-slate-950">Registered</dt>
                      <dd>
                        {enrollment.data_regjistrimit
                          ? new Date(enrollment.data_regjistrimit).toLocaleDateString()
                          : "Not set"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {isPaid ? (
                  <Button className="mt-6" disabled fullWidth>
                    Paid
                  </Button>
                ) : (
                  <div className="mt-6 space-y-3">
                    <SelectInput
                      value={
                        paymentMethodByEnrollment[enrollment.id] || "simulated"
                      }
                      onChange={(e) =>
                        setPaymentMethodByEnrollment((current) => ({
                          ...current,
                          [enrollment.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="simulated">Simulated payment</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="cash">Cash</option>
                    </SelectInput>
                    <Button
                      onClick={() => payEnrollment(enrollment.id)}
                      disabled={payingEnrollmentId === enrollment.id}
                      fullWidth
                    >
                      {payingEnrollmentId === enrollment.id
                        ? "Paying..."
                        : `Pay ${Number(
                            enrollment.final_amount || enrollment.cmimi || 0
                          ).toFixed(2)} EUR`}
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 md:col-span-2 xl:col-span-3">
            You are not enrolled in any courses yet.
          </div>
        )}
      </section>
    </PageContainer>
  );
};

export default MyEnrollments;

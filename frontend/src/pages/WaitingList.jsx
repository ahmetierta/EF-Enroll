import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import { waitingListService } from "../services/waitingListService";
import { getAuthUser } from "../utils/authStorage";

const WaitingList = () => {
  const authUser = getAuthUser();
  const authRole = authUser?.role;
  const canPromote = ["admin", "professor"].includes(authRole);
  const [waitingList, setWaitingList] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchWaitingList = () => {
    waitingListService
      .getAll()
      .then((res) => setWaitingList(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Waiting list could not be loaded.");
      });
  };

  useEffect(() => {
    fetchWaitingList();
  }, []);

  const summary = useMemo(() => {
    const courseIds = new Set(waitingList.map((item) => item.course_id));
    const availablePromotions = waitingList.filter(
      (item) => Number(item.available_seats || 0) > 0
    ).length;

    return {
      total: waitingList.length,
      courses: courseIds.size,
      availablePromotions,
    };
  }, [waitingList]);

  const promoteStudent = (waitingListId) => {
    setMessage("");
    setError("");
    setProcessingId(waitingListId);

    waitingListService
      .promote(waitingListId)
      .then((res) => {
        setMessage(res.data.message || "Student promoted successfully.");
        fetchWaitingList();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Student could not be promoted.");
      })
      .finally(() => setProcessingId(null));
  };

  const removeItem = (waitingListId) => {
    setMessage("");
    setError("");
    setProcessingId(waitingListId);

    waitingListService
      .remove(waitingListId)
      .then((res) => {
        setMessage(res.data.message || "Waiting list item removed.");
        fetchWaitingList();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Waiting list item could not be removed.");
      })
      .finally(() => setProcessingId(null));
  };

  return (
    <PageContainer title={authRole === "student" ? "My Waiting List" : "Waiting List"}>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Waiting Students</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Courses</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{summary.courses}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ready To Promote</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {summary.availablePromotions}
          </p>
        </div>
      </div>

      <TableCard title="Waiting List Entries">
        {message && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-blue-700">
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {waitingList.length > 0 ? (
              waitingList.map((item) => {
                const canPromoteItem =
                  canPromote && Number(item.available_seats || 0) > 0;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      #{item.pozicioni || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {item.student_name || "Student"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.student_email || item.numri_studentit || "No details"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {item.course_name || "Course"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.professor_name || "No professor"} - {item.kredite || 0} credits
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          Number(item.available_seats || 0) > 0
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {item.available_seats} / {item.kapaciteti} available
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.data ? new Date(item.data).toLocaleDateString() : "Not set"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canPromote && (
                          <Button
                            onClick={() => promoteStudent(item.id)}
                            disabled={!canPromoteItem || processingId === item.id}
                            className="px-3 py-2 text-sm"
                          >
                            Promote
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => removeItem(item.id)}
                          disabled={processingId === item.id}
                          className="px-3 py-2 text-sm"
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan="6">
                  No waiting list entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </PageContainer>
  );
};

export default WaitingList;

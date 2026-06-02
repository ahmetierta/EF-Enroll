import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import TableCard from "../components/layout/TableCard";
import Button from "../components/ui/Button";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import { waitingListService } from "../services/waitingListService";
import { getAuthUser } from "../utils/authStorage";

const initialFilters = {
  search: "",
  statusi: "",
  prioriteti: "",
  readiness: "",
};

const statusStyles = {
  waiting: "bg-yellow-50 text-yellow-700",
  notified: "bg-blue-50 text-blue-700",
  paused: "bg-slate-100 text-slate-700",
};

const priorityStyles = {
  high: "bg-red-50 text-red-700",
  normal: "bg-slate-100 text-slate-700",
};

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "Not set";
}

function getWaitEstimate(item) {
  const availableSeats = Number(item.available_seats || 0);

  if (availableSeats > 0) {
    return "Seat available now";
  }

  const days = Number(item.estimated_wait_days || 0);

  if (!days) {
    return "Next in line";
  }

  return `About ${days} days`;
}

const WaitingList = () => {
  const authUser = getAuthUser();
  const authRole = authUser?.role;
  const canPromote = ["admin", "professor"].includes(authRole);
  const canManageQueue = ["admin", "professor"].includes(authRole);
  const [waitingList, setWaitingList] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

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

  const filteredWaitingList = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return waitingList.filter((item) => {
      const text = [
        item.student_name,
        item.student_email,
        item.numri_studentit,
        item.course_name,
        item.professor_name,
        item.arsyeja,
      ]
        .join(" ")
        .toLowerCase();
      const availableSeats = Number(item.available_seats || 0);

      if (searchTerm && !text.includes(searchTerm)) {
        return false;
      }

      if (filters.statusi && item.statusi !== filters.statusi) {
        return false;
      }

      if (filters.prioriteti && item.prioriteti !== filters.prioriteti) {
        return false;
      }

      if (filters.readiness === "ready" && availableSeats <= 0) {
        return false;
      }

      if (filters.readiness === "waiting" && availableSeats > 0) {
        return false;
      }

      return true;
    });
  }, [filters, waitingList]);

  const summary = useMemo(() => {
    const courseIds = new Set(waitingList.map((item) => item.course_id));
    const availablePromotions = waitingList.filter(
      (item) => Number(item.available_seats || 0) > 0
    ).length;
    const highPriority = waitingList.filter(
      (item) => item.prioriteti === "high"
    ).length;
    const notified = waitingList.filter((item) => item.statusi === "notified").length;

    return {
      total: waitingList.length,
      courses: courseIds.size,
      availablePromotions,
      highPriority,
      notified,
    };
  }, [waitingList]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

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

  const updateItem = (waitingListId, data) => {
    setMessage("");
    setError("");
    setProcessingId(waitingListId);

    waitingListService
      .update(waitingListId, data)
      .then((res) => {
        setMessage(res.data.message || "Waiting list updated.");
        fetchWaitingList();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Waiting list could not be updated.");
      })
      .finally(() => setProcessingId(null));
  };

  const removeItem = (waitingListId) => {
    setMessage("");
    setError("");

    if (confirmRemoveId !== waitingListId) {
      setConfirmRemoveId(waitingListId);
      setMessage("Click Remove again to confirm.");
      return;
    }

    setProcessingId(waitingListId);

    waitingListService
      .remove(waitingListId)
      .then((res) => {
        setConfirmRemoveId(null);
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
      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Entries</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Courses</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{summary.courses}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ready</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {summary.availablePromotions}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">High Priority</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {summary.highPriority}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Notified</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.notified}
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

        <div className="mb-5 grid gap-3 md:grid-cols-5">
          <TextInput
            name="search"
            placeholder="Search queue"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <SelectInput
            name="statusi"
            value={filters.statusi}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            <option value="waiting">Waiting</option>
            <option value="notified">Notified</option>
            <option value="paused">Paused</option>
          </SelectInput>
          <SelectInput
            name="prioriteti"
            value={filters.prioriteti}
            onChange={handleFilterChange}
          >
            <option value="">All priorities</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </SelectInput>
          <SelectInput
            name="readiness"
            value={filters.readiness}
            onChange={handleFilterChange}
          >
            <option value="">Any readiness</option>
            <option value="ready">Seat available</option>
            <option value="waiting">Still waiting</option>
          </SelectInput>
          <Button onClick={resetFilters} variant="secondary">
            Clear Filters
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-blue-700">
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Queue</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredWaitingList.length > 0 ? (
                filteredWaitingList.map((item) => {
                  const availableSeats = Number(item.available_seats || 0);
                  const canPromoteItem = canPromote && availableSeats > 0;
                  const isProcessing = processingId === item.id;

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
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[item.statusi] || statusStyles.waiting
                            }`}
                          >
                            {item.statusi || "waiting"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              priorityStyles[item.prioriteti] || priorityStyles.normal
                            }`}
                          >
                            {item.prioriteti || "normal"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {getWaitEstimate(item)}
                        </p>
                        {item.arsyeja && (
                          <p className="mt-1 text-xs text-slate-500">
                            Note: {item.arsyeja}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            availableSeats > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {item.available_seats} / {item.kapaciteti} available
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div>Joined: {formatDate(item.data)}</div>
                        <div>Notified: {formatDate(item.data_njoftimit)}</div>
                        <div>Reply by: {formatDate(item.afati_pergjigjes)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {canPromote && (
                            <Button
                              onClick={() => promoteStudent(item.id)}
                              disabled={!canPromoteItem || isProcessing}
                              className="px-3 py-2 text-sm"
                            >
                              Promote
                            </Button>
                          )}
                          {canManageQueue && (
                            <>
                              <Button
                                onClick={() =>
                                  updateItem(item.id, { statusi: "notified" })
                                }
                                disabled={isProcessing}
                                className="px-3 py-2 text-sm"
                                variant="secondary"
                              >
                                Notify
                              </Button>
                              <Button
                                onClick={() =>
                                  updateItem(item.id, {
                                    prioriteti:
                                      item.prioriteti === "high" ? "normal" : "high",
                                  })
                                }
                                disabled={isProcessing}
                                className="px-3 py-2 text-sm"
                                variant="secondary"
                              >
                                {item.prioriteti === "high" ? "Normal" : "High"}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="secondary"
                            onClick={() => removeItem(item.id)}
                            disabled={isProcessing}
                            className="px-3 py-2 text-sm"
                          >
                            {confirmRemoveId === item.id ? "Confirm" : "Remove"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="7">
                    No waiting list entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </PageContainer>
  );
};

export default WaitingList;

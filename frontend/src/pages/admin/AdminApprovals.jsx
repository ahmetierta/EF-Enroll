import { useEffect, useState } from "react";
import FormCard from "../../components/layout/FormCard";
import PageContainer from "../../components/layout/PageContainer";
import TableCard from "../../components/layout/TableCard";
import Button from "../../components/ui/Button";
import { adminService } from "../../services/adminService";
import { getAuthUser } from "../../utils/authStorage";

const AdminApprovals = () => {
  const [pendingProfessors, setPendingProfessors] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const authUser = getAuthUser();

  function fetchPendingProfessors() {
    adminService
      .getPendingProfessors()
      .then((res) => setPendingProfessors(res.data))
      .catch((err) => {
        setError(
          err.response?.data?.message || "Pending professor accounts could not be loaded."
        );
      });
  }

  useEffect(() => {
    fetchPendingProfessors();
  }, []);

  const approveProfessor = (userId) => {
    setMessage("");
    setError("");

    adminService
      .approveProfessor(userId)
      .then((res) => {
        setMessage(res.data.message);
        fetchPendingProfessors();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Approval failed.");
      });
  };

  const rejectProfessor = (userId) => {
    setMessage("");
    setError("");

    adminService
      .rejectProfessor(userId)
      .then((res) => {
        setMessage(res.data.message);
        fetchPendingProfessors();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Rejection failed.");
      });
  };

  return (
    <PageContainer title="Admin Approvals">
      <div className="grid gap-8 lg:grid-cols-3">
        <FormCard title="Approval Rules">
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              Professor accounts are created with <strong>pending</strong>{" "}
              status. They cannot log in until an admin approves them.
            </p>
            <p>
              Logged in as:{" "}
              <strong>{authUser?.email || "Unknown admin"}</strong>
            </p>
          </div>
        </FormCard>

        <TableCard title="Pending Professors">
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingProfessors.length > 0 ? (
                pendingProfessors.map((professor) => (
                  <tr
                    key={professor.user_id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">{professor.username}</td>
                    <td className="px-4 py-3">{professor.email}</td>
                    <td className="px-4 py-3">{professor.titulli}</td>
                    <td className="px-4 py-3">{professor.departamenti}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                        {professor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => approveProfessor(professor.user_id)}
                          className="px-3 py-2"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectProfessor(professor.user_id)}
                          className="px-3 py-2"
                          variant="danger"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="6">
                    No pending professor accounts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      </div>
    </PageContainer>
  );
};

export default AdminApprovals;

const statusClasses = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const StatusMessage = ({ message, type = "info" }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
        statusClasses[type] || statusClasses.info
      }`}
      role="status"
    >
      {message}
    </div>
  );
};

export default StatusMessage;

import AppLayout from "../AppLayout";

const AdminLayout = () => {
  return (
    <AppLayout
      navRoles={["admin"]}
      sectionLabel="EF Enroll Admin"
      title="Admin Dashboard"
      subtitle="Manage approvals, users, courses, schedules, payments, and system data."
    />
  );
};

export default AdminLayout;

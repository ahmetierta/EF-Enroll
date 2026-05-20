import AppLayout from "../AppLayout";

const UserLayout = () => {
  return (
    <AppLayout
      navRoles={["student"]}
      sectionLabel="EF Enroll Student"
      title="Student Portal"
      subtitle="Browse courses, track enrollments, payments, and course materials."
    />
  );
};

export default UserLayout;

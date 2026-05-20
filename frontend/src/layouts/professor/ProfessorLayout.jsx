import AppLayout from "../AppLayout";

const ProfessorLayout = () => {
  return (
    <AppLayout
      navRoles={["professor"]}
      sectionLabel="EF Enroll Professor"
      title="Professor Dashboard"
      subtitle="Review assigned courses, student enrollments, announcements, and materials."
    />
  );
};

export default ProfessorLayout;

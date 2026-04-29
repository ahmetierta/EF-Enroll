export const navItems = [
  { to: "/admin/approvals", label: "Approvals", roles: ["admin"] },
  { to: "/courses", label: "Courses", roles: ["admin", "professor"] },
  { to: "/students", label: "Students", roles: ["admin", "professor"] },
  { to: "/professors", label: "Professors", roles: ["admin"] },
  { to: "/semesters", label: "Semesters", roles: ["admin"] },
  { to: "/departments", label: "Departments", roles: ["admin"] },
  { to: "/schedules", label: "Schedules", roles: ["admin", "professor"] },
  { to: "/enrollments", label: "Enrollments", roles: ["admin", "professor"] },
  { to: "/waiting-list", label: "Waiting List", roles: ["admin"] },
  { to: "/announcements", label: "Announcements", roles: ["admin", "professor"] },
];

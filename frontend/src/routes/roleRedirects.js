export const roleHomePaths = {
  admin: "/admin/dashboard",
  professor: "/professor/dashboard",
  student: "/student/dashboard",
};

export function getRoleHomePath(role) {
  return roleHomePaths[role] || "/";
}

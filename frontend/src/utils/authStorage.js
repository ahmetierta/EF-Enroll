export function saveAuth(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getAuthUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    clearAuth();
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("user");
}

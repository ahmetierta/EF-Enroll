const SESSION_DURATION_MS = 60 * 60 * 1000;

export function saveAuth(user) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem(
    "sessionExpiresAt",
    String(Date.now() + SESSION_DURATION_MS)
  );
}

export function getAuthUser() {
  const user = localStorage.getItem("user");
  const sessionExpiresAt = Number(localStorage.getItem("sessionExpiresAt"));

  if (!user || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
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
  localStorage.removeItem("sessionExpiresAt");
}

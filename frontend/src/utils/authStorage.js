export function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
}

export function getAuthUser() {
  const token = getAuthToken();
  const user = localStorage.getItem("user");

  if (!token || !user || isTokenExpired(token)) {
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
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

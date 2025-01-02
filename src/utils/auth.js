export function getBearerToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bearerToken");
  }
  return null;
}

export function isAuthenticated() {
  return !!getBearerToken();
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bearerToken");
    window.location.href = "/login";
  }
}

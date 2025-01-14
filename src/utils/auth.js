export function getBearerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("bearerToken");
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!getBearerToken();
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("bearerToken");
  window.location.href = "/login";
}

export function handleApiError(error) {
  console.error("API Error:", error);
  logout();
}

// Keeps every HTTP request in one place and attaches the saved bearer token.
(() => {
  const baseUrl = "/api/v1";
  const storageKey = "tourease-token";

  function getToken() {
    return localStorage.getItem(storageKey);
  }

  function saveToken(token) {
    localStorage.setItem(storageKey, token);
  }

  function clearToken() {
    localStorage.removeItem(storageKey);
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body !== undefined) headers.set("Content-Type", "application/json");

    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    if (response.status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent("tourease:unauthorized"));
    }

    if (response.status === 204) return null;
    const body = await response.json();
    if (!response.ok) {
      const error = new Error(body.message || `Request failed (${response.status}).`);
      error.status = response.status;
      error.details = Array.isArray(body.errors) ? body.errors : [];
      throw error;
    }
    return body;
  }

  function queryString(values) {
    const query = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) query.set(key, value);
    });
    const text = query.toString();
    return text ? `?${text}` : "";
  }

  window.TourEaseApi = {
    getToken,
    saveToken,
    clearToken,
    request,
    queryString,
    destinations: (params = {}) => request(`/destinations${queryString(params)}`),
    destination: (id) => request(`/destinations/${encodeURIComponent(id)}`),
    createDestination: (data) => request("/destinations", { method: "POST", body: JSON.stringify(data) }),
    deleteDestination: (id) => request(`/destinations/${encodeURIComponent(id)}`, { method: "DELETE" }),
    guides: (params = {}) => request(`/tour-guides${queryString(params)}`),
    accommodations: (params = {}) => request(`/accommodations${queryString(params)}`),
    register: (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
    login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    itineraries: () => request("/itineraries"),
    createItinerary: (data) => request("/itineraries", { method: "POST", body: JSON.stringify(data) }),
    deleteItinerary: (id) => request(`/itineraries/${encodeURIComponent(id)}`, { method: "DELETE" }),
    itineraryDestinations: (id) => request(`/itineraries/${encodeURIComponent(id)}/destinations`),
    addStop: (id, data) => request(`/itineraries/${encodeURIComponent(id)}/destinations`, { method: "POST", body: JSON.stringify(data) }),
    deleteStop: (id, entryId) => request(`/itineraries/${encodeURIComponent(id)}/destinations/${encodeURIComponent(entryId)}`, { method: "DELETE" }),
  };
})();

// Builds the visitor interface with DOM methods so API text is never parsed as HTML.
(() => {
  const api = window.TourEaseApi;
  const state = {
    session: readSession(),
    destinationPage: 1,
    guidePage: 1,
    stayPage: 1,
    selectedItineraryId: null,
    destinationFilters: {},
    guideFilters: {},
    stayFilters: {},
  };
  const byId = (id) => document.getElementById(id);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function readSession() {
    const token = api.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(token.split(".")[1])));
      if (!payload.sub || !payload.role) throw new Error("Missing session claims.");
      return { userId: payload.sub, role: payload.role };
    } catch {
      api.clearToken();
      return null;
    }
  }

  function decodeBase64Url(value) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  function showToast(message, details = []) {
    const toast = element("div", "toast");
    const content = element("div");
    content.append(element("strong", "", message));
    details.forEach((detail) => content.append(element("div", "", detail)));
    const dismiss = element("button", "", "×");
    dismiss.type = "button";
    dismiss.setAttribute("aria-label", "Dismiss message");
    dismiss.addEventListener("click", () => toast.remove());
    toast.append(content, dismiss);
    byId("toast-region").append(toast);
    window.setTimeout(() => toast.remove(), 7000);
  }

  async function perform(action) {
    try {
      await action();
    } catch (error) {
      showToast(error.message || "Something went wrong.", error.details || []);
    }
  }

  function setLoading(container, message = "Loading…") {
    container.replaceChildren(element("div", "loading-state", message));
  }

  function setEmpty(container, message = "No results yet. Try changing your filters.") {
    container.replaceChildren(element("div", "empty-state", message));
  }

  function formatMoney(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? `PHP ${amount.toLocaleString("en-PH", { maximumFractionDigits: 2 })}` : "PHP 0";
  }

  function createButton(label, className, action, id) {
    const button = element("button", className, label);
    button.type = "button";
    button.dataset.action = action;
    if (id !== undefined) button.dataset.id = id;
    return button;
  }

  // Create a link for navigation to the standalone authentication pages.
  function createLink(label, className, href) {
    const link = element("a", className, label);
    link.href = href;
    return link;
  }

  // Render the logged-in controls and the correct access prompt for team tools.
  function renderAuthNav() {
    const nav = byId("auth-nav");
    nav.replaceChildren();
    if (state.session) {
      nav.append(element("span", "role-pill", state.session.role));
      nav.append(createButton("Logout", "button button-outline button-small", "logout"));
    } else {
      nav.append(createLink("Log in", "button button-outline button-small", "/login.html"));
      nav.append(createLink("Register", "button button-primary button-small", "/register.html"));
    }
    const canManage = state.session && ["Staff", "Admin"].includes(state.session.role);
    byId("manage").hidden = Boolean(state.session) && !canManage;
    byId("manage-auth-prompt").hidden = Boolean(state.session);
    byId("create-destination-form").hidden = !canManage;
    loadDestinations();
    loadTrips();
  }

  function renderPagination(container, page, totalItems, limit, changePage) {
    container.replaceChildren();
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    if (totalPages <= 1) return;
    const previous = createButton("Previous", "button button-outline button-small", "page-previous");
    previous.disabled = page <= 1;
    const next = createButton("Next", "button button-outline button-small", "page-next");
    next.disabled = page >= totalPages;
    previous.addEventListener("click", () => changePage(page - 1));
    next.addEventListener("click", () => changePage(page + 1));
    container.append(previous, element("span", "", `Page ${page} of ${totalPages}`), next);
  }

  function destinationCard(destination) {
    const card = element("article", "destination-card");
    const banner = element("div", "destination-banner", "🏞️");
    banner.setAttribute("aria-hidden", "true");
    const body = element("div", "card-body");
    body.append(element("h3", "", destination.destinationName));
    body.append(element("p", "", destination.address));
    const meta = element("div", "card-meta");
    meta.append(element("span", "", Number(destination.entranceFee) === 0 ? "Free" : formatMoney(destination.entranceFee)));
    body.append(meta);
    const actions = element("div", "card-actions");
    actions.append(createButton("View details", "button button-primary button-small", "details", destination.destinationId));
    if (state.session && state.session.role === "Admin") {
      actions.append(createButton("Delete", "button button-danger button-small", "delete-destination", destination.destinationId));
    }
    body.append(actions);
    card.append(banner, body);
    return card;
  }

  async function loadDestinations() {
    const results = byId("destination-results");
    setLoading(results, "Finding destinations…");
    try {
      const response = await api.destinations({
        ...state.destinationFilters,
        page: state.destinationPage,
        limit: 9,
      });
      results.replaceChildren();
      if (!response.destinations || response.destinations.length === 0) setEmpty(results);
      else response.destinations.forEach((destination) => results.append(destinationCard(destination)));
      renderPagination(byId("destination-pages"), response.page, response.totalItems, response.limit, (page) => {
        state.destinationPage = page;
        loadDestinations();
      });
    } catch (error) {
      setEmpty(results, "Destinations could not be loaded.");
      showToast(error.message, error.details || []);
    }
  }

  function infoCard(icon, title, lines) {
    const card = element("article", "info-card");
    card.append(element("span", "icon", icon));
    const body = element("div", "card-body");
    body.append(element("h3", "", title));
    lines.filter(Boolean).forEach((line) => body.append(element("p", "", line)));
    card.append(body);
    return card;
  }

  async function loadGuides() {
    const results = byId("guide-results");
    setLoading(results, "Finding local guides…");
    try {
      const response = await api.guides({ ...state.guideFilters, page: state.guidePage, limit: 9 });
      results.replaceChildren();
      if (!response.tourGuides || response.tourGuides.length === 0) setEmpty(results);
      else response.tourGuides.forEach((guide) => {
        results.append(infoCard("🧭", guide.fullName, [
          guide.specialization,
          guide.phoneNumber,
        ]));
      });
      renderPagination(byId("guide-pages"), response.page, response.totalItems, response.limit, (page) => {
        state.guidePage = page;
        loadGuides();
      });
    } catch (error) {
      setEmpty(results, "Tour guides could not be loaded.");
      showToast(error.message, error.details || []);
    }
  }

  async function loadStays() {
    const results = byId("stay-results");
    setLoading(results, "Finding a place to stay…");
    try {
      const response = await api.accommodations({ ...state.stayFilters, page: state.stayPage, limit: 9 });
      results.replaceChildren();
      if (!response.accommodations || response.accommodations.length === 0) setEmpty(results);
      else response.accommodations.forEach((stay) => {
        results.append(infoCard("🛏️", stay.accommodationName, [
          stay.address,
          `${formatMoney(stay.pricePerNight)} / night`,
          stay.contactNumber,
        ]));
      });
      renderPagination(byId("stay-pages"), response.page, response.totalItems, response.limit, (page) => {
        state.stayPage = page;
        loadStays();
      });
    } catch (error) {
      setEmpty(results, "Stays could not be loaded.");
      showToast(error.message, error.details || []);
    }
  }

  function addField(parent, labelText, name, type, options = {}) {
    const label = element("label", "", labelText);
    const input = element("input");
    input.name = name;
    input.type = type;
    Object.entries(options).forEach(([key, value]) => {
      if (key === "maxLength") input.maxLength = value;
      else if (key === "minLength") input.minLength = value;
      else input.setAttribute(key, value === true ? "" : value);
    });
    label.append(input);
    parent.append(label);
    return input;
  }

  function addSelectField(parent, labelText, name, options) {
    const label = element("label", "", labelText);
    const select = element("select");
    select.name = name;
    options.forEach(({ value, text }) => {
      const option = element("option", "", text);
      option.value = value;
      select.append(option);
    });
    label.append(select);
    parent.append(label);
    return select;
  }

  async function showDestinationDetails(id) {
    const dialog = byId("detail-dialog");
    const content = byId("detail-dialog-content");
    content.replaceChildren(element("p", "loading-state", "Loading destination details…"));
    dialog.showModal();
    try {
      const destination = await api.destination(id);
      const [guideResponse, stayResponse] = await Promise.all([
        api.guides({ destinationId: id, page: 1, limit: 50 }),
        api.accommodations({ destinationId: id, page: 1, limit: 50 }),
      ]);
      const wrapper = element("div", "dialog-content");
      wrapper.append(element("p", "eyebrow", "Destination details"));
      wrapper.append(element("h2", "", destination.destinationName));
      const fields = element("div", "detail-grid");
      [
        ["Description", destination.description],
        ["Address", destination.address],
        ["Entrance fee", Number(destination.entranceFee) === 0 ? "Free" : formatMoney(destination.entranceFee)],
        ["Coordinates", `${destination.latitude}, ${destination.longitude}`],
      ].forEach(([label, value]) => {
        const field = element("p");
        field.append(element("strong", "", `${label}: `), document.createTextNode(value ?? ""));
        fields.append(field);
      });
      wrapper.append(fields);
      const mapLink = element("a", "link-button", "Open in Google Maps ↗");
      mapLink.href = `https://www.google.com/maps?q=${encodeURIComponent(destination.latitude)},${encodeURIComponent(destination.longitude)}`;
      mapLink.target = "_blank";
      mapLink.rel = "noopener noreferrer";
      wrapper.append(mapLink);
      wrapper.append(element("h3", "", "Tour guides"));
      wrapper.append(buildDialogList(guideResponse.tourGuides || [], (guide) => [
        guide.fullName,
        [guide.specialization, guide.phoneNumber].filter(Boolean).join(" · "),
      ], "No guides listed for this destination."));
      wrapper.append(element("h3", "", "Places to stay"));
      wrapper.append(buildDialogList(stayResponse.accommodations || [], (stay) => [
        stay.accommodationName,
        `${stay.address} · ${formatMoney(stay.pricePerNight)} / night`,
      ], "No stays listed for this destination."));
      if (state.session) {
        wrapper.append(createButton("Add to my trip", "button button-primary", "add-destination-to-trip", destination.destinationId));
      }
      content.replaceChildren(wrapper);
    } catch (error) {
      content.replaceChildren(element("p", "empty-state", "Details could not be loaded."));
      showToast(error.message, error.details || []);
    }
  }

  function buildDialogList(items, getText, emptyText) {
    const list = element("div", "dialog-list");
    if (items.length === 0) {
      list.append(element("p", "empty-state", emptyText));
      return list;
    }
    items.forEach((item) => {
      const [title, description] = getText(item);
      const card = element("article");
      card.append(element("h4", "", title), element("p", "", description));
      list.append(card);
    });
    return list;
  }

  function showAddToTrip(destinationId) {
    if (!state.session) {
      window.location.assign("/login.html?redirect=index.html%23trips");
      return;
    }
    const dialog = byId("trip-dialog");
    const content = byId("trip-dialog-content");
    content.replaceChildren(element("p", "loading-state", "Loading your trips…"));
    byId("detail-dialog").close();
    dialog.showModal();
    perform(async () => {
      const tripResponse = await api.itineraries();
      const wrapper = element("div", "dialog-content");
      wrapper.append(element("p", "eyebrow", "Plan a stop"));
      wrapper.append(element("h2", "", "Add destination to a trip"));
      const form = element("form", "stack-form");
      const trips = tripResponse.itineraries || [];
      if (trips.length === 0) {
        form.append(element("p", "", "Create a trip in My Trips first, then add this destination."));
      } else {
        addSelectField(form, "Choose a trip", "itineraryId", trips.map((trip) => ({
          value: trip.itineraryId,
          text: trip.itineraryName,
        })));
        addField(form, "Visit date", "visitDate", "date", { required: true });
        addField(form, "Visit order", "visitOrder", "number", { required: true, min: 1, step: 1 });
        const submit = element("button", "button button-primary", "Add stop");
        submit.type = "submit";
        form.append(submit);
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          perform(async () => {
            const values = Object.fromEntries(new FormData(form).entries());
            try {
              await api.addStop(values.itineraryId, {
                destinationId: Number(destinationId),
                visitDate: values.visitDate,
                visitOrder: Number(values.visitOrder),
              });
            } catch (error) {
              if (error.status === 409 && error.message.includes("Visit order")) {
                error.message = "That visit order is already used in this trip. Choose another number.";
              }
              throw error;
            }
            dialog.close();
            state.selectedItineraryId = Number(values.itineraryId);
            loadTrips();
            showToast("Destination added to your trip.");
          });
        });
      }
      wrapper.append(form);
      content.replaceChildren(wrapper);
    });
  }

  function renderTripsPrompt(container, text, withLogin) {
    const panel = element("div", "empty-state", text);
    if (withLogin) {
      panel.append(document.createTextNode(" "));
      panel.append(createLink("Log in to view trips", "button button-primary button-small", "/login.html?redirect=index.html%23trips"));
    }
    container.replaceChildren(panel);
  }

  async function loadTrips() {
    const container = byId("trips-content");
    if (!container) return;
    if (!state.session) {
      renderTripsPrompt(container, "Log in to plan and manage your trips.", true);
      return;
    }
    setLoading(container, "Loading your trips…");
    try {
      const response = await api.itineraries();
      renderTrips(container, response.itineraries || []);
    } catch (error) {
      if (error.status === 401) return;
      container.replaceChildren(element("p", "empty-state", "Your trips could not be loaded."));
      showToast(error.message, error.details || []);
    }
  }

  function renderTrips(container, trips) {
    container.replaceChildren();
    const createPanel = element("form", "trip-create stack-form");
    createPanel.append(element("h3", "", "Create a trip"));
    addField(createPanel, "Trip name", "itineraryName", "text", { required: true, maxLength: 150 });
    addField(createPanel, "Start date", "startDate", "date", { required: true });
    addField(createPanel, "End date", "endDate", "date", { required: true });
    const createButtonNode = element("button", "button button-primary", "Create trip");
    createButtonNode.type = "submit";
    createPanel.append(createButtonNode);
    createPanel.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(createPanel).entries());
      if (values.endDate < values.startDate) {
        showToast("End date must be on or after the start date.");
        return;
      }
      perform(async () => {
        const itinerary = await api.createItinerary(values);
        state.selectedItineraryId = itinerary.itineraryId;
        showToast("Your trip has been created.");
        loadTrips();
      });
    });
    container.append(createPanel);
    if (trips.length === 0) {
      container.append(element("p", "empty-state", "No trips yet. Create one to start planning."));
      return;
    }

    const layout = element("div", "trip-layout");
    const list = element("div", "trip-list");
    trips.forEach((trip) => {
      const card = element("article", `trip-card${Number(state.selectedItineraryId) === Number(trip.itineraryId) ? " selected" : ""}`);
      const head = element("div", "trip-card-head");
      const open = element("button", "button", trip.itineraryName);
      open.type = "button";
      open.dataset.action = "open-trip";
      open.dataset.id = trip.itineraryId;
      open.addEventListener("click", () => {
        state.selectedItineraryId = trip.itineraryId;
        loadTripStops(trip);
        card.classList.add("selected");
      });
      head.append(open, createButton("Delete", "button button-danger button-small", "delete-trip", trip.itineraryId));
      card.append(head);
      card.append(element("p", "", `${trip.startDate || "Start date not set"} – ${trip.endDate || "End date not set"}`));
      list.append(card);
    });
    layout.append(list);
    const panel = element("div", "stops-panel");
    if (state.selectedItineraryId) {
      const selected = trips.find((trip) => Number(trip.itineraryId) === Number(state.selectedItineraryId));
      if (selected) {
        layout.append(panel);
        loadTripStops(selected, panel);
      } else {
        state.selectedItineraryId = trips[0].itineraryId;
        layout.append(panel);
        loadTripStops(trips[0], panel);
      }
    } else {
      panel.append(element("p", "empty-state", "Choose a trip to see its stops."));
      layout.append(panel);
    }
    container.append(layout);
  }

  async function loadTripStops(trip, panel) {
    const target = panel || byId("trips-content").querySelector(".stops-panel");
    if (!target) return;
    setLoading(target, "Loading trip stops…");
    try {
      const response = await api.itineraryDestinations(trip.itineraryId);
      const stops = (response.destinations || []).slice().sort((a, b) => a.visitOrder - b.visitOrder);
      const namedStops = await Promise.all(stops.map(async (stop) => ({
        ...stop,
        destination: await api.destination(stop.destinationId),
      })));
      target.replaceChildren(element("h3", "", `${trip.itineraryName} — stops`));
      if (namedStops.length === 0) target.append(element("p", "empty-state", "This trip has no stops yet."));
      namedStops.forEach((stop) => {
        const row = element("div", "stop-item");
        const info = element("div");
        info.append(element("strong", "", `${stop.visitOrder}. ${stop.destination.destinationName}`));
        info.append(element("p", "", `${stop.visitDate} · ${stop.destination.address}`));
        row.append(info, createButton("Remove", "button button-danger button-small", "delete-stop", stop.itineraryDestinationId));
        row.dataset.itineraryId = trip.itineraryId;
        target.append(row);
      });
      const addForm = element("form", "trip-stop-form");
      const destinations = await api.destinations({ page: 1, limit: 50 });
      const destinationList = destinations.destinations || [];
      if (destinationList.length > 0) {
        addSelectField(addForm, "Destination", "destinationId", destinationList.map((destination) => ({
          value: destination.destinationId,
          text: destination.destinationName,
        })));
        addField(addForm, "Visit date", "visitDate", "date", { required: true });
        addField(addForm, "Visit order", "visitOrder", "number", { required: true, min: 1, step: 1 });
        const submit = element("button", "button button-primary", "Add stop");
        submit.type = "submit";
        addForm.append(submit);
        addForm.addEventListener("submit", (event) => {
          event.preventDefault();
          perform(async () => {
            const values = Object.fromEntries(new FormData(addForm).entries());
            try {
              await api.addStop(trip.itineraryId, {
                destinationId: Number(values.destinationId),
                visitDate: values.visitDate,
                visitOrder: Number(values.visitOrder),
              });
            } catch (error) {
              if (error.status === 409 && error.message.includes("Visit order")) {
                error.message = "That visit order is already used in this trip. Choose another number.";
              }
              throw error;
            }
            loadTripStops(trip, target);
            showToast("Stop added to your trip.");
          });
        });
        target.append(addForm);
      }
    } catch (error) {
      if (error.status === 401) return;
      target.replaceChildren(element("p", "empty-state", "Trip stops could not be loaded."));
      showToast(error.message, error.details || []);
    }
  }

  function bindEvents() {
    byId("hero-search").addEventListener("submit", (event) => {
      event.preventDefault();
      const query = new FormData(event.currentTarget).get("q").toString().trim();
      byId("destination-filters").elements.q.value = query;
      state.destinationFilters.q = query;
      state.destinationPage = 1;
      loadDestinations();
      byId("destinations").scrollIntoView({ behavior: "smooth" });
    });
    byId("destination-filters").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      state.destinationFilters = values;
      state.destinationPage = 1;
      loadDestinations();
    });
    byId("guide-filters").addEventListener("submit", (event) => {
      event.preventDefault();
      state.guideFilters = Object.fromEntries(new FormData(event.currentTarget).entries());
      state.guidePage = 1;
      loadGuides();
    });
    byId("stay-filters").addEventListener("submit", (event) => {
      event.preventDefault();
      state.stayFilters = Object.fromEntries(new FormData(event.currentTarget).entries());
      state.stayPage = 1;
      loadStays();
    });
    byId("create-destination-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      perform(async () => {
        const values = Object.fromEntries(new FormData(form).entries());
        values.latitude = Number(values.latitude);
        values.longitude = Number(values.longitude);
        values.entranceFee = Number(values.entranceFee);
        await api.createDestination(values);
        form.reset();
        loadDestinations();
        showToast("Destination added.");
      });
    });
    byId("menu-toggle").addEventListener("click", () => byId("main-nav").classList.toggle("open"));
    document.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close]");
      if (close) close.closest("dialog").close();
      if (event.target.closest("#main-nav a")) byId("main-nav").classList.remove("open");
      const trigger = event.target.closest("[data-action]");
      if (!trigger) return;
      const { action, id } = trigger.dataset;
      if (action === "logout") {
        api.clearToken();
        state.session = null;
        state.selectedItineraryId = null;
        renderAuthNav();
        showToast("You have logged out.");
      } else if (action === "details") showDestinationDetails(id);
      else if (action === "add-destination-to-trip") showAddToTrip(id);
      else if (action === "delete-destination") perform(async () => {
        if (!window.confirm("Delete this destination?")) return;
        await api.deleteDestination(id);
        loadDestinations();
        showToast("Destination deleted.");
      });
      else if (action === "delete-trip") perform(async () => {
        if (!window.confirm("Delete this trip and its stops?")) return;
        await api.deleteItinerary(id);
        if (Number(state.selectedItineraryId) === Number(id)) state.selectedItineraryId = null;
        loadTrips();
        showToast("Trip deleted.");
      });
      else if (action === "delete-stop") perform(async () => {
        const itineraryId = trigger.closest(".stop-item").dataset.itineraryId;
        await api.deleteStop(itineraryId, id);
        const trip = await api.itineraries();
        const selected = (trip.itineraries || []).find((item) => Number(item.itineraryId) === Number(itineraryId));
        if (selected) loadTripStops(selected);
        showToast("Stop removed.");
      });
      if (trigger.closest("#main-nav")) byId("main-nav").classList.remove("open");
    });
    document.addEventListener("click", (event) => {
      if (event.target.matches("dialog")) event.target.close();
    });
    window.addEventListener("tourease:unauthorized", () => {
      state.session = null;
      state.selectedItineraryId = null;
      window.location.assign("/login.html?redirect=index.html");
    });
  }

  function start() {
    bindEvents();
    renderAuthNav();
    loadGuides();
    loadStays();
  }

  start();
})();

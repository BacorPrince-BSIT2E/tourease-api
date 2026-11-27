(() => {
  const api = window.TourEaseApi;

  // Decode the claims needed to check an existing JWT.
  function decodeTokenPayload(token) {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const encoded = parts[1];
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  // Accept only a well-formed token with an unexpired identity and role.
  function hasValidToken() {
    const token = api.getToken();
    if (!token) return false;
    try {
      const payload = decodeTokenPayload(token);
      const valid = Boolean(payload && payload.sub && payload.role
        && Number.isFinite(payload.exp) && payload.exp * 1000 > Date.now());
      if (!valid) api.clearToken();
      return valid;
    } catch {
      api.clearToken();
      return false;
    }
  }

  // Display API and validation messages using text only.
  function showMessage(message, success = false) {
    const box = document.getElementById("auth-message");
    box.textContent = message;
    box.setAttribute("role", success ? "status" : "alert");
    box.classList.toggle("auth-message-success", success);
    box.hidden = !message;
  }

  // Prevent duplicate submissions while a request is pending.
  function setLoading(button, loading, idleText, loadingText) {
    button.disabled = loading;
    button.textContent = loading ? loadingText : idleText;
  }

  // Check the email shape before sending it to the API.
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Keep post-login redirects on this site.
  function getRedirectTarget() {
    const requested = new URLSearchParams(window.location.search).get("redirect");
    if (!requested) return "/index.html";
    try {
      const target = new URL(requested, window.location.href);
      return target.origin === window.location.origin ? target.href : "/index.html";
    } catch {
      return "/index.html";
    }
  }

  // Toggle visibility for the password fields on the current form.
  function initializePasswordToggle(form) {
    const toggle = form.querySelector("#show-password");
    toggle.addEventListener("change", () => {
      form.querySelectorAll('input[type="password"], input[data-visible="true"]').forEach((input) => {
        input.type = toggle.checked ? "text" : "password";
        if (toggle.checked) input.dataset.visible = "true";
        else delete input.dataset.visible;
      });
    });
  }

  // Submit validated login credentials and save the returned access token.
  async function submitLogin(form, button) {
    if (!form.reportValidity()) return;
    const email = form.elements.email.value.trim();
    if (!isValidEmail(email)) {
      showMessage("Enter a valid email address.");
      return;
    }
    showMessage("");
    setLoading(button, true, "Log in", "Logging in…");
    try {
      const response = await api.login({ email, password: form.elements.password.value });
      if (typeof response?.accessToken !== "string" || !response.accessToken) {
        throw new Error("The login response did not include an access token.");
      }
      api.saveToken(response.accessToken);
      window.location.assign(getRedirectTarget());
    } catch (error) {
      showMessage(error.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(button, false, "Log in", "Logging in…");
    }
  }

  // Connect the login form, password toggle, and submit handler.
  function initializeLogin(form) {
    const button = document.getElementById("auth-submit");
    initializePasswordToggle(form);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitLogin(form, button);
    });
  }

  // Submit matching registration fields and show the API's conflict response.
  async function submitRegistration(form, button) {
    if (!form.reportValidity()) return;
    const fullName = form.elements.fullName.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const confirmPassword = form.elements.confirmPassword.value;
    if (!fullName) {
      showMessage("Enter your full name.");
      return;
    }
    if (!isValidEmail(email)) {
      showMessage("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      showMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }
    showMessage("");
    setLoading(button, true, "Create account", "Creating account…");
    let redirecting = false;
    try {
      await api.register({ fullName, email, password });
      redirecting = true;
      showMessage("Account created! Redirecting to login...", true);
      window.setTimeout(() => window.location.assign("/login.html"), 1500);
    } catch (error) {
      showMessage(error.status === 409
        ? error.message || "Email already exists."
        : error.message || "Unable to create your account. Please try again.");
    } finally {
      if (!redirecting) setLoading(button, false, "Create account", "Creating account…");
    }
  }

  // Connect the registration form and its shared show-password control.
  function initializeRegistration(form) {
    const button = document.getElementById("auth-submit");
    initializePasswordToggle(form);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitRegistration(form, button);
    });
  }

  // Redirect signed-in visitors and initialize the page's matching form.
  function initialize() {
    if (hasValidToken()) {
      window.location.replace("/index.html");
      return;
    }
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    if (loginForm) initializeLogin(loginForm);
    if (registerForm) initializeRegistration(registerForm);
  }

  initialize();
})();

// login.js
function initLogin() {
  console.log("Initializing login...");

  const loginForm = document.getElementById("loginForm");
  const errorBox = document.getElementById("errorBox");
  const loginButton = document.getElementById("login-button");

  if (!loginForm || !errorBox || !loginButton) {
    console.error("Required elements not found");
    return;
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Disable button and show loading state
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    errorBox.style.display = "none";

    try {
      // Call the login API
      const response = await LibraryAPI.request("/auth/login", "POST", {
        username,
        password,
      });

      // Store the token in localStorage
      localStorage.setItem("token", response.token);

      // Use the router to navigate to dashboard
      window.router.navigateTo("Admin-Dashboard");
    } catch (error) {
      console.error("Login error:", error);

      // Show error message
      errorBox.textContent = error.message || "Invalid username or password";
      errorBox.style.display = "block";

      // Reset button state
      loginButton.disabled = false;
      loginButton.textContent = "Login";
    }
  });
}

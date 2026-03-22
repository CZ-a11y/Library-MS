function initLogin() {
  console.log("Initializing login page");

  const loginForm = document.getElementById("loginForm");
  const errorBox = document.getElementById("errorBox");

  if (!loginForm) {
    console.error("Login form not found in the DOM.");
    return;
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "admin123") {
      window.location.hash = "Admin-Dashboard";
      window.location.reload(); // Force reload to ensure the new route is loaded
      console.log("Login successful!");
    } else {
      if (errorBox) {
        errorBox.style.display = "block";
        errorBox.textContent = "Invalid username or password.";
      }
    }
  });
}

// Ensure the DOM is fully loaded before running
function init() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    initLogin();
  } else {
    setTimeout(init, 100); // Retry after a short delay if the form is not found
  }
}

// Run the init function when the DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

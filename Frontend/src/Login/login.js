// login.js

// Ensure the DOM is fully loaded before running
document.addEventListener("DOMContentLoaded", init);

function init() {
  console.log("Login page initialized");

  const loginForm = document.getElementById("loginForm");
  const errorBox = document.getElementById("errorBox");

  // If the form is not found, stop and log an error
  if (!loginForm) {
    console.error("loginForm not found");
    return;
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    // Dummy validation (replace with real auth later)
    if (username === "admin" && password === "admin123") {
      // Navigate to dashboard SPA-style
      window.location.hash = "Admin-Dashboard";
      console.log("Login successful!");
    } else {
      if (errorBox) {
        errorBox.style.display = "block";
        errorBox.textContent = "Invalid username or password.";
      }
    }
  });
}

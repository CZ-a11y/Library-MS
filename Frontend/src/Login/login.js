document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const errorBox = document.getElementById("errorBox");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Example validation logic
    if (username === "admin" && password === "admin123") {
      window.location.href = "../Admin-Dashboard/dashboard.html"; // Redirect to dashboard
    } else {
      errorBox.style.display = "block";
    }
  });
});

function init() {
  console.log("Login page initialized");

  const loginForm = document.getElementById("loginForm");
  const errorBox = document.getElementById("errorBox");

  if (!loginForm) {
    console.error("loginForm not found");
    return;
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username")?.value;
    const password = document.getElementById("password")?.value;

    if (username === "admin" && password === "admin123") {
      // ✅ SPA navigation (IMPORTANT)
      window.location.hash = "Admin-Dashboard";
    } else {
      if (errorBox) {
        errorBox.style.display = "block";
      }
    }
  });
}

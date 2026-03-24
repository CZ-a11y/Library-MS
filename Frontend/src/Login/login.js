function initLogin() {
  console.log("Login page initialized");

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    console.error("loginForm not found");
    return;
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username")?.value;
    const password = document.getElementById("password")?.value;

    if (username === "admin" && password === "admin123") {
      window.location.hash = "Admin-Dashboard";
    } else {
      document.getElementById("errorBox").style.display = "block";
    }
  });
}

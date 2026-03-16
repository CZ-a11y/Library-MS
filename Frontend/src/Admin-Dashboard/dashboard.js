document.addEventListener("DOMContentLoaded", function () {
  const logoutIcon = document.querySelector(".logout-icon");
  const modal = document.getElementById("logoutModal");
  const confirmLogout = document.getElementById("confirmLogout");
  const cancelLogout = document.getElementById("cancelLogout");

  logoutIcon.addEventListener("click", function () {
    modal.style.display = "flex";
  });

  confirmLogout.addEventListener("click", function () {
    modal.style.display = "none";

    window.location.href = "/Frontend/src/Login/login.html";
  });

  cancelLogout.addEventListener("click", function () {
    modal.style.display = "none";
  });
});

function initDashboard() {
  console.log("Dashboard initialized");

  // --- Sidebar & Mobile Overlay Logic ---
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  function toggleSidebar() {
    sidebar?.classList.toggle("open");
    sidebarOverlay?.classList.toggle("show");
  }

  function closeSidebar() {
    sidebar?.classList.remove("open");
    sidebarOverlay?.classList.remove("show");
  }

  menuToggle?.addEventListener("click", toggleSidebar);
  sidebarOverlay?.addEventListener("click", closeSidebar);

  // --- Active Menu Item Logic ---
  const menuItems = document.querySelectorAll(".menu li");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");

      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // --- Logout Modal Logic ---
  const logoutTrigger = document.getElementById("logoutTrigger");
  const modal = document.getElementById("logoutModal");
  const confirmLogout = document.getElementById("confirmLogout");
  const cancelLogout = document.getElementById("cancelLogout");

  function openModal() {
    modal?.classList.add("show");
  }

  function closeModal() {
    modal?.classList.remove("show");
  }

  logoutTrigger?.addEventListener("click", openModal);
  cancelLogout?.addEventListener("click", closeModal);

  confirmLogout?.addEventListener("click", () => {
    closeModal();

    // ✅ IMPORTANT: use SPA routing instead of full reload
    window.location.hash = "Login";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("show")) {
      closeModal();
    }
  });
}

// 🔥 CRITICAL: expose to router
window.initDashboard = initDashboard;

// Define routes
const routes = [
  {
    path: "Admin-Dashboard",
    template: "Frontend/src/Admin-Dashboard/dashboard.html",
    script: "Frontend/src/Admin-Dashboard/dashboard.js",
  },
  {
    path: "Books",
    template: "Frontend/src/Books/books.html",
    script: "Frontend/src/Books/books.js",
  },
  {
    path: "Members",
    template: "Frontend/src/Members/members.html",
    script: "Frontend/src/Members/members.js",
  },
  {
    path: "Borrow-Return",
    template: "Frontend/src/Borrow-Return/borrow-return.html",
    script: "Frontend/src/Borrow-Return/borrow-return.js",
  },
  {
    path: "Login",
    template: "Frontend/src/Login/login.html",
    script: "Frontend/src/Login/login.js",
  },
];

class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentScript = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkRoute();
  }

  setupEventListeners() {
    window.addEventListener("hashchange", () => this.checkRoute());

    document.addEventListener("DOMContentLoaded", () => {
      document.body.addEventListener("click", (e) => {
        const link = e.target.closest("[data-link]");
        if (link) {
          e.preventDefault();
          const path = link.getAttribute("href").replace("#", "");
          this.navigateTo(path);
        }
      });
    });
  }

  checkRoute() {
    const hash = window.location.hash.replace("#", "") || "Login";

    console.log("Navigating to:", hash);

    const route = this.routes.find((route) => route.path === hash);

    if (route) {
      this.loadRoute(route);
    } else {
      console.warn("Route not found, redirecting to Login");
      this.navigateTo("Login");
    }
  }

  navigateTo(path) {
    if (window.location.hash.replace("#", "") !== path) {
      window.location.hash = path;
    }
  }

  async loadRoute(route) {
    const app = document.getElementById("app");

    // Show loading state
    app.innerHTML = "<p>Loading...</p>";

    try {
      console.log("Fetching:", route.template);

      const response = await fetch(route.template);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      // Inject HTML
      app.innerHTML = html;

      // Load script if exists
      if (route.script) {
        this.loadScript(route.script);
      }
    } catch (err) {
      console.error("Error loading route:", err);

      app.innerHTML = `
        <h2>Error loading page</h2>
        <p>${err.message}</p>
      `;
    }
  }

  loadScript(src) {
    // Remove previous script
    if (this.currentScript) {
      this.currentScript.remove();
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;

    script.onload = () => console.log(`Script loaded: ${src}`);
    script.onerror = () => console.error(`Failed to load script: ${src}`);

    document.body.appendChild(script);
    this.currentScript = script;
  }
}

// Initialize router
new Router(routes);

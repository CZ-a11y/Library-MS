const routes = [
  {
    path: "Admin-Dashboard",
    template: "/Frontend/src/Admin-Dashboard/dashboard.html",
    css: "/Frontend/src/Admin-Dashboard/dashboard.css",
    script: "/Frontend/src/Admin-Dashboard/dashboard.js",
    init: "initDashboard",
    requiresAuth: true,
    dependencies: ["/Frontend/src/js/utils.js"],
  },
  {
    path: "Books",
    template: "/Frontend/src/Books/books.html",
    css: "/Frontend/src/Books/books-styles.css",
    script: "/Frontend/src/Books/books.js",
    init: "initBooks",
    requiresAuth: true,
    dependencies: ["/Frontend/src/js/utils.js"],
  },
  {
    path: "Members",
    template: "/Frontend/src/Members/members.html",
    css: "/Frontend/src/Members/members.css",
    script: "/Frontend/src/Members/members.js",
    init: "initMembers",
    requiresAuth: true,
    dependencies: ["/Frontend/src/js/utils.js"],
  },
  {
    path: "Borrow-Return",
    template: "/Frontend/src/Borrow-Return/borrow-return.html",
    css: "/Frontend/src/Borrow-Return/borrow-return.css",
    script: "/Frontend/src/Borrow-Return/borrow-return.js",
    init: "initBorrowReturn",
    requiresAuth: true,
    dependencies: ["/Frontend/src/js/utils.js"],
  },
  {
    path: "Login",
    template: "/Frontend/src/Login/login.html",
    css: "/Frontend/src/Login/styles.css",
    script: "/Frontend/src/Login/login.js",
    init: "initLogin",
    requiresAuth: false,
    dependencies: ["/Frontend/src/js/utils.js"],
  },
];

class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentScript = null;
    this.currentCSS = null;
    this.loadedScripts = new Set();
    this.init();
  }

  init() {
    this.checkRoute();

    window.addEventListener("hashchange", () => this.checkRoute());

    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]");
      if (link) {
        e.preventDefault();
        const path = link.getAttribute("href").replace("#", "");
        this.navigateTo(path);
      }
    });
  }

  checkRoute() {
    const hash = window.location.hash.replace("#", "") || "Login";
    const route = this.routes.find((r) => r.path === hash);

    if (route) {
      // Check authentication if required
      if (route.requiresAuth && !this.isAuthenticated()) {
        this.navigateTo("Login");
        return;
      }
      this.loadRoute(route);
    } else {
      this.navigateTo("Login");
    }
  }

  isAuthenticated() {
    // Check if user is authenticated without relying on LibraryAPI
    return !!localStorage.getItem("token");
  }

  navigateTo(path) {
    window.location.hash = `#${path}`;
  }

  async loadRoute(route) {
    const app = document.getElementById("app");
    app.innerHTML = "<p>Loading...</p>";

    try {
      // Load HTML
      const response = await fetch(route.template);
      const html = await response.text();
      app.innerHTML = html;

      // Load CSS
      if (route.css) this.loadCSS(route.css);

      // Load dependencies first
      if (route.dependencies && route.dependencies.length > 0) {
        await this.loadDependencies(route.dependencies);
      }

      // Load main script
      if (route.script) {
        this.loadScript(route.script, route.init);
      }
    } catch (error) {
      console.error("Route load error:", error);
      app.innerHTML = `<h2>Error loading page</h2><p>${error.message}</p>`;
    }
  }

  loadCSS(href) {
    if (this.currentCSS) this.currentCSS.remove();

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;

    document.head.appendChild(link);
    this.currentCSS = link;
  }

  async loadDependencies(dependencies) {
    // Load all dependencies in sequence
    for (const dep of dependencies) {
      if (!this.loadedScripts.has(dep)) {
        await this.loadSingleScript(dep);
        this.loadedScripts.add(dep);
      }
    }
  }

  loadSingleScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;

      script.onload = () => {
        console.log(`Dependency loaded: ${src}`);
        resolve();
      };

      script.onerror = () => {
        console.error(`Failed to load dependency: ${src}`);
        reject(new Error(`Failed to load ${src}`));
      };

      document.body.appendChild(script);
    });
  }

  loadScript(src, initFunctionName) {
    if (this.currentScript) this.currentScript.remove();

    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      console.log(`Script loaded: ${src}`);

      // Call the init function if it exists
      if (initFunctionName && typeof window[initFunctionName] === "function") {
        // Retry if the function isn't ready yet
        const tryInit = () => {
          if (typeof window[initFunctionName] === "function") {
            window[initFunctionName]();
          } else {
            setTimeout(tryInit, 100);
          }
        };
        tryInit();
      } else {
        console.warn(`Init function ${initFunctionName} not found`);
      }
    };

    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
    };

    document.body.appendChild(script);
    this.currentScript = script;
  }
}

// Initialize the router
const router = new Router(routes);
window.router = router; // Make router available globally

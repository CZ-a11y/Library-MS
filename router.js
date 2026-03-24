const routes = [
  {
    path: "Admin-Dashboard",
    template: "/Frontend/src/Admin-Dashboard/dashboard.html",
    css: "/Frontend/src/Admin-Dashboard/dashboard.css",
    script: "/Frontend/src/Admin-Dashboard/dashboard.js",
    init: "initDashboard",
  },
  {
    path: "Books",
    template: "/Frontend/src/Books/books.html",
    css: "/Frontend/src/Books/books-styles.css",
    script: "/Frontend/src/Books/books.js",
    init: "initBooks",
  },
  {
    path: "Members",
    template: "/Frontend/src/Members/members.html",
    css: "/Frontend/src/Members/members.css",
    script: "/Frontend/src/Members/members.js",
    init: "initMembers",
  },
  {
    path: "Borrow-Return",
    template: "/Frontend/src/Borrow-Return/borrow-return.html",
    css: "/Frontend/src/Borrow-Return/borrow-return.css",
    script: "/Frontend/src/Borrow-Return/borrow-return.js",
    init: "initBorrowReturn",
  },
  {
    path: "Login",
    template: "/Frontend/src/Login/login.html",
    css: "/Frontend/src/Login/styles.css",
    script: "/Frontend/src/Login/login.js",
    init: "initLogin",
  },
];

class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentScript = null;
    this.currentCSS = null;
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
      this.loadRoute(route);
    } else {
      this.navigateTo("Login");
    }
  }

  navigateTo(path) {
    window.location.hash = `#${path}`;
  }

  async loadRoute(route) {
    const app = document.getElementById("app");
    app.innerHTML = "<p>Loading...</p>";

    try {
      const response = await fetch(route.template);
      const html = await response.text();

      // Inject HTML
      app.innerHTML = html;

      // Load CSS
      if (route.css) this.loadCSS(route.css);

      // Load JS and run correct init
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

  loadScript(src, initFunctionName) {
    if (this.currentScript) this.currentScript.remove();

    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      console.log(`Script loaded: ${src}`);

      // ✅ Call the correct init function
      if (initFunctionName && typeof window[initFunctionName] === "function") {
        window[initFunctionName]();
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

new Router(routes);

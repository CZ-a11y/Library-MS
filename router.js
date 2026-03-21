const routes = [
  {
    path: "Admin-Dashboard",
    template: "/Frontend/src/Admin-Dashboard/dashboard.html",
    css: "/Frontend/src/Admin-Dashboard/dashboard.css",
    script: "/Frontend/src/Admin-Dashboard/dashboard.js",
  },
  {
    path: "Books",
    template: "/Frontend/src/Books/books.html",
    css: "/Frontend/src/Books/books-styles.css",
    script: "/Frontend/src/Books/books.js",
  },
  {
    path: "Members",
    template: "/Frontend/src/Members/members.html",
    css: "/Frontend/src/Members/members.css",
    script: "/Frontend/src/Members/members.js",
  },
  {
    path: "Borrow-Return",
    template: "/Frontend/src/Borrow-Return/borrow-return.html",
    css: "/Frontend/src/Borrow-Return/borrow-return.css",
    script: "/Frontend/src/Borrow-Return/borrow-return.js",
  },
  {
    path: "Login",
    template: "/Frontend/src/Login/login.html",
    css: "/Frontend/src/Login/styles.css",
    script: "/Frontend/src/Login/login.js",
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
    // Handle initial route
    this.checkRoute();

    // Handle hash changes
    window.addEventListener("hashchange", () => this.checkRoute());

    // Handle navigation clicks
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]");
      if (link) {
        e.preventDefault();
        const path = link.getAttribute("href").replace("#", "");
        console.log("Link clicked, navigating to:", path);
        this.navigateTo(path);
      }
    });
  }

  checkRoute() {
    const hash = window.location.hash.replace("#", "") || "Login";
    console.log("Checking route for hash:", hash);

    const route = this.routes.find((r) => r.path === hash);

    if (route) {
      console.log("Route found:", route.path);
      this.loadRoute(route);
    } else {
      console.log("Route not found, redirecting to Login");
      this.navigateTo("Login");
    }
  }

  navigateTo(path) {
    console.log("Navigating to path:", path);
    window.location.hash = `#${path}`;
  }

  async loadRoute(route) {
    const app = document.getElementById("app");
    app.innerHTML = "<p>Loading...</p>";

    try {
      console.log("Fetching template:", route.template);
      const response = await fetch(route.template);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      app.innerHTML = html;

      if (route.css) {
        this.loadCSS(route.css);
      }

      if (route.script) {
        this.loadScript(route.script);
      }
    } catch (error) {
      console.error("Route load error:", error);
      app.innerHTML = `<h2>Error loading page</h2><p>${error.message}</p>`;
    }
  }

  loadCSS(href) {
    if (this.currentCSS) {
      this.currentCSS.remove();
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;

    link.onload = () => {
      console.log(`CSS loaded: ${href}`);
    };

    link.onerror = () => {
      console.error(`Failed to load CSS: ${href}`);
    };

    document.head.appendChild(link);
    this.currentCSS = link;
  }

  loadScript(src) {
    if (this.currentScript) {
      this.currentScript.remove();
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;

    script.onload = () => {
      console.log(`Script loaded: ${src}`);
      if (typeof window.init === "function") {
        window.init();
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

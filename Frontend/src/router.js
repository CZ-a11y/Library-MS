// Define routes
const routes = [
  {
    path: "Admin-Dashboard",
    template: "./Admin-Dashboard/dashboard.html",
    script: "./Admin-Dashboard/dashboard.js",
  },
  {
    path: "Books",
    template: "./Books/books.html",
    script: "./Books/books.js",
  },
  {
    path: "Members",
    template: "./Members/members.html",
    script: "./Members/members.js",
  },
  {
    path: "Borrow-Return",
    template: "./Borrow-Return/borrow-return.html",
    script: "./Borrow-Return/borrow-return.js",
  },
  {
    path: "Login",
    template: "./Login/login.html",
    script: "./Login/login.js",
  },
];

class Router {
  constructor(routes) {
    this.routes = routes;
    this.setupEventListeners();
    this.checkRoute();
  }

  setupEventListeners() {
    window.addEventListener("hashchange", () => this.checkRoute());
    document.addEventListener("DOMContentLoaded", () => {
      document.body.addEventListener("click", (e) => {
        if (e.target.matches("[data-link]")) {
          e.preventDefault();
          const path = e.target.getAttribute("href").replace("#", "");
          this.navigateTo(path);
        }
      });
    });
  }

  checkRoute() {
    const hash = window.location.hash.replace("#", "") || "Login";
    const route = this.routes.find((route) => route.path === hash);
    if (route) {
      this.loadRoute(route);
    } else {
      this.navigateTo("Login");
    }
  }

  navigateTo(path) {
    window.location.hash = path;
    this.checkRoute();
  }

  loadRoute(route) {
    fetch(route.template)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        document.getElementById("app").innerHTML = html;
        if (route.script) {
          this.loadScript(route.script);
        }
      })
      .catch((err) => {
        console.error("Error loading route:", err);
        this.navigateTo("Login");
      });
  }

  loadScript(src) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => console.log(`Script ${src} loaded`);
    script.onerror = () => console.error(`Error loading script ${src}`);
    document.body.appendChild(script);
  }
}

const router = new Router(routes);

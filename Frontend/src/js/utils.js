console.log("Loading utils.js");

// Create a global object for our API utilities
window.LibraryAPI = window.LibraryAPI || {};

// API base URL - make sure this matches your backend URL
LibraryAPI.API_BASE_URL = "http://localhost:5000/api";

// Function to make API requests with improved error handling
LibraryAPI.request = async function (endpoint, method = "GET", data = null) {
  const url = `${LibraryAPI.API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "x-auth-token": token }),
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem("token");
      if (window.router) {
        window.router.navigateTo("Login");
      } else {
        window.location.hash = "#Login";
      }
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const responseData = await response.json();

    // Check if the response has a success flag
    if (responseData.success === false) {
      throw new Error(responseData.message || "Request failed");
    }

    return responseData;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Function to check if user is authenticated
LibraryAPI.isAuthenticated = function () {
  return !!localStorage.getItem("token");
};

// Function to logout
LibraryAPI.logout = function () {
  localStorage.removeItem("token");
  if (window.router) {
    window.router.navigateTo("Login");
  } else {
    window.location.hash = "#Login";
  }
};

// Function to initialize the page based on authentication status
LibraryAPI.initPage = function () {
  if (
    !LibraryAPI.isAuthenticated() &&
    !window.location.hash.includes("#Login")
  ) {
    if (window.router) {
      window.router.navigateTo("Login");
    } else {
      window.location.hash = "#Login";
    }
  }
};

// Function to handle API errors consistently
LibraryAPI.handleError = function (error) {
  let errorMessage = "An error occurred";

  if (error.message) {
    if (error.message.includes("Unauthorized")) {
      errorMessage = "Session expired. Please login again.";
      LibraryAPI.logout();
    } else if (error.message.includes("Duplicate entry")) {
      errorMessage = "This record already exists";
    } else if (error.message.includes("not found")) {
      errorMessage = "Record not found";
    } else if (error.message.includes("validation")) {
      errorMessage = "Validation error: " + error.message;
    } else {
      errorMessage = error.message;
    }
  }

  return errorMessage;
};

console.log("LibraryAPI utilities loaded successfully");

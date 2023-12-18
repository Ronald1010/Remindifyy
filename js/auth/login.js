import {
  backendURL,
  successNotification,
  errorNotification,
} from "../utils/utils.js";

// Form Login
const form_login = document.getElementById("form_login");

form_login.onsubmit = async (e) => {
  e.preventDefault();

  // Disable Button
  document.querySelector("#form_login button").disabled = true;
  document.querySelector(
    "#form_login button"
  ).innerHTML = `<div class="spinner-border me-2" role="status">
                      </div>
                      <span>Loading...</span>`;

  // Get Values of Form (input, textarea, select) set it as form-data
  const formData = new FormData(form_login);

  // ...

  const response = await fetch(backendURL + "/api/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  // Get response if 200-299 status code
  if (response.ok) {
    const json = await response.json();

    // Store Token and User ID
    localStorage.setItem("token", json.token);
    localStorage.setItem("userId", json.user.id); // Update to extract the user ID from 'json.user.id'

    form_login.reset();

    successNotification("Successfully login account.");

    // Redirect Page
    window.location.pathname = "/test.html";
  }
  // Get response if 422 status code
  else if (response.status == 422) {
    const json = await response.json();

    errorNotification(json.message, 5);
  }

  // Enable Button
  document.querySelector("#form_login button").disabled = false;
  document.querySelector("#form_login button").innerHTML = `Login`;
};

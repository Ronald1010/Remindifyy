import { setRouter } from "../router/router.js";

// Set Router
setRouter();

// Backend URL
const backendURL = "http://backend.test";
// const backendURL =
//   "https://2b01-2a09-bac1-5aa0-00-278-55.ngrok-free.app/backend/public";

// Get Logged User Profile
async function getLoggedUser() {
  try {
    // Access User Profile API Endpoint
    const response = await fetch(backendURL + "/api/profile/show", {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      // Handle HTTP errors
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user data");
    }

    const userData = await response.json();

    // Update HTML element with user's full name
    document.getElementById("user_logged").innerHTML =
      userData.firstname + " " + userData.lastname;

    // Display the user image if the 'image' property exists in the response data
    if (userData.image) {
      const imageUrl = backendURL + "/storage/" + userData.image;

      // Create an image element
      const imageElement = document.createElement("img");
      imageElement.src = imageUrl;
      imageElement.alt = "User Image";

      // Clear existing content before appending new image
      const imageContainer = document.getElementById("user_image");
      imageContainer.innerHTML = "";
      imageContainer.appendChild(imageElement);
    }

    // If the element with ID "user_id" exists, set its value to the user's ID
    const userIdElement = document.getElementById("user_id");
    if (userIdElement) {
      userIdElement.value = userData.id;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Handle error gracefully, distinguishing between network errors and API errors
    if (error instanceof TypeError) {
      errorNotification(
        "Network error. Please check your internet connection.",
        10
      );
    } else {
      errorNotification(error.message || "Failed to fetch user data", 10);
    }
  }
}

// Notifications
function successNotification(message, seconds = 0) {
  document.querySelector(".alert-success").classList.remove("d-none");
  document.querySelector(".alert-success").classList.add("d-block");
  document.querySelector(".alert-success").innerHTML = message;

  if (seconds != 0) {
    setTimeout(function () {
      document.querySelector(".alert-success").classList.remove("d-block");
      document.querySelector(".alert-success").classList.add("d-none");
    }, seconds * 1000);
  }
}

function errorNotification(message, seconds = 0) {
  document.querySelector(".alert-danger").classList.remove("d-none");
  document.querySelector(".alert-danger").classList.add("d-block");
  document.querySelector(".alert-danger").innerHTML = message;

  if (seconds != 0) {
    setTimeout(function () {
      document.querySelector(".alert-danger").classList.remove("d-block");
      document.querySelector(".alert-danger").classList.add("d-none");
    }, seconds * 1000);
  }
}
// Function to convert text to speech
function speakText(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  // Speech settings (optional)
  utterance.volume = 1; // Volume range: 0 to 1
  utterance.rate = 1; // Speaking rate (1 is normal)
  utterance.pitch = 1; // Pitch (0 to 2)

  // Speak the text
  synth.speak(utterance);
}
export {
  backendURL,
  successNotification,
  errorNotification,
  getLoggedUser,
  speakText /* other exports if any */,
};

import {
  successNotification,
  errorNotification,
  getLoggedUser,
  backendURL,
} from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const modalElement = document.getElementById("modal_edit");
  const modal = new bootstrap.Modal(modalElement);

  document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("bi-pencil-fill")) {
      event.preventDefault();

      console.log("Bi-pencil-fill button clicked");

      const taskId = event.target.closest(".card").dataset.taskId;

      try {
        const taskDetails = await fetchTaskDetails(taskId);
        populateModalForm(taskDetails);
        modal.show(); // Show the modal after data is populated
      } catch (error) {
        console.error("Error fetching task details:", error);
        errorNotification("Error fetching task details");
      }
    }
  });

  async function fetchTaskDetails(taskId) {
    try {
      const bearerToken = localStorage.getItem("token");
      const fetchURL = `${backendURL}/api/tasks/${taskId}`;

      const response = await fetch(fetchURL, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      if (response.ok) {
        const taskData = await response.json();
        console.log("Task details fetched:", taskData);
        return taskData;
      } else {
        throw new Error(`Failed to fetch task details for ID ${taskId}`);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      throw error;
    }
  }

  function populateModalForm(taskDetails) {
    try {
      console.log("Populating modal with task details:", taskDetails);

      const modalForm = document.getElementById("modal_form");

      // Set values to form fields
      modalForm.querySelector("#id").value = taskDetails.id;
      modalForm.querySelector("#task_name").value = taskDetails.task_name;
      modalForm.querySelector("#description").value = taskDetails.description;
      modalForm.querySelector("#image_path").src = taskDetails.image_path;
      modalForm.querySelector("#deadline_date").value =
        taskDetails.deadline_date;
      modalForm.querySelector("#deadline_time").value =
        taskDetails.deadline_time;

      // Update other form elements as needed based on task details
    } catch (error) {
      console.error("Error populating modal form:", error);
      throw error;
    }
  }

  const modalForm = document.getElementById("modal_form");
  modalForm.reset();

  modalForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = modalForm.querySelector("#id").value;
    const imageFileInput = modalForm.querySelector("#image_path");
    const updatedTask = {
      task_name: modalForm.querySelector("#task_name").value,
      description: modalForm.querySelector("#description").value,
      image: imageFileInput.files[0],
    };

    try {
      await updateTaskWithMethodSpoofing(id, updatedTask, "PUT"); // Use method spoofing for the update
      console.log("Task updated successfully!");

      modal.hide();
    } catch (error) {
      console.error("Error updating task:", error);
      // Handle error scenario
    }
  });

  // Function to update task data using method spoofing
  async function updateTaskWithMethodSpoofing(taskId, updatedTaskData, method) {
    try {
      const bearerToken = localStorage.getItem("token");
      const updateURL = `${backendURL}/api/tasks/${taskId}`;

      const formData = new FormData();
      formData.append("task_name", updatedTaskData.task_name);
      formData.append("description", updatedTaskData.description);
      if (updatedTaskData.image) {
        formData.append("image_path", updatedTaskData.image); // Append the file to form data
      }

      formData.append("_method", method); // Add _method parameter for method spoofing

      const response = await fetch(updateURL, {
        method: "POST", // Always use POST for method spoofing
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        body: formData, // Send form data with the file
      });

      if (response.ok) {
        // Optionally handle response after a successful update
        const updatedTask = await response.json();
        return updatedTask;
      } else {
        throw new Error(`Failed to update task with ID ${taskId}`);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }
});

//
//
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form_tasks");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    try {
      const taskName = document.getElementById("task_name").value;
      const description = document.getElementById("description").value;
      const image = document.querySelector("#image_path").files[0]; // Use # for ID selector
      const deadlineDate = document.getElementById("deadline_date").value;
      const deadlineTime = document.getElementById("deadline_time").value;

      const data = {
        task_name: taskName,
        description: description,
        image_path: image,
        deadline_date: deadlineDate,
        deadline_time: deadlineTime,
        // Add other form field values here
      };

      const createdTask = await createTask(data);
      console.log("Task created:", createdTask);

      form.reset(); // Reset the form after successful submission

      successNotification("Task created successfully");

      // Store the created task ID
      storeTaskId(createdTask.id);
    } catch (error) {
      console.error("Error storing task:", error);
      errorNotification("Failed to create task");
    }
  });
});

function storeTaskId(taskId) {
  // You can use localStorage or sessionStorage to store the ID
  localStorage.setItem("taskId", taskId);
}

async function createTask(data) {
  try {
    const bearerToken = localStorage.getItem("token");
    const createURL = `${backendURL}/api/tasks`; // Replace with your API endpoint

    const formData = new FormData();

    formData.append("task_name", data.task_name);
    formData.append("description", data.description);
    formData.append("deadline_date", data.deadline_date);
    formData.append("deadline_time", data.deadline_time);

    // Check if image is available before appending it
    if (data.image_path) {
      formData.append("image_path", data.image_path);
    }

    const response = await fetch(createURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    const createdTask = await response.json(); // Get the created task object from server response
    return createdTask; // Return the created task (including task_id)
  } catch (error) {
    throw new Error("Failed to create task");
  }
}

// SEARCH
document.addEventListener("DOMContentLoaded", async () => {
  try {
    getLoggedUser();

    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url") || "";
    const keyword = urlParams.get("keyword") || "";

    const getDataDiv = document.getElementById("get_data");

    if (url || keyword) {
      getDataDiv.innerHTML = `
        <div class="col-sm-12 d-flex justify-content-center align-items-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <b class="ms-2">Loading Data...</b>
        </div>`;
    }

    const queryParams = `?${url !== "" ? url + "&" : ""}${
      keyword !== "" ? "keyword=" + keyword : ""
    }`;

    const bearerToken = localStorage.getItem("token");

    if (!bearerToken) {
      throw new Error("Token not found");
    }

    const response = await fetch(`${backendURL}/api/tasks${queryParams}`, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + bearerToken,
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayData(data);
    } else {
      throw new Error(`HTTP-Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error);
    errorNotification(error.message, 10);
  }
});

// CREATE CARD
function createCard(element) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("col-sm-4", "pb-5", "lg-3");

  const timestamp = Date.parse(element.created_at);

  if (!isNaN(timestamp)) {
    const date = new Date(timestamp);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    const cardContent = `
      <div class="card" data-task-id="${element.id}">
        <div class="card-body">
          <div class="row align-items-center pb-3">
            <div class="col">
              <small>${formattedDate}</small>
            </div>

            <div class="col text-end">
             <a
                  href="#"
                  id="btn_delete"
                  
                  style="text-decoration: none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="#FF0000"
                    class="bi bi-trash3-fill"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"
                    />
                  </svg>
                </a>

                <a
                  href="#"
                  id="btn_edit"
                  data-bs-toggle="modal"
                  type="button"
                  data-bs-target="#modal_edit"
                 
                  style="text-decoration: none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="#0000FF"
                    class="bi bi-pencil-fill"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"
                    />
                  </svg>
                </a>
            </div>
          </div>
          ${
            element.image_path && element.image_path.trim() !== ""
              ? `<img src="${backendURL}/storage/${element.image_path}" width="100%" />`
              : ""
          }
          <h5 class="card-title py-3">${element.task_name}</h5>
          <p class="card-text">${element.description}</p>
          <br>
          ${
            element.deadline_date && element.deadline_time
              ? `<div class="float-end">Due Date: ${element.deadline_date} ${element.deadline_time}</div><br>`
              : ""
          }
        </div>
      </div>`;

    itemDiv.innerHTML = cardContent;

    // DELETE Button and CLEAR FORM MODAL code...
    // DELETE Button
    const deleteButton = itemDiv.querySelector(".bi-trash3-fill");
    if (deleteButton) {
      deleteButton.addEventListener("click", async (event) => {
        event.preventDefault();
        const taskId = event.target.closest(".card").dataset.taskId;

        try {
          const confirmed = confirm(
            "Are you sure you want to delete this task?"
          );
          if (confirmed) {
            await deleteTask(taskId);
            event.target.closest(".card").remove();
            successNotification("Task deleted successfully");
          }
        } catch (error) {
          console.error("Error deleting task:", error);
          errorNotification("Error deleting task");
        }
      });
    }

    // CLEAR FORM MODAL
    const creationModal = document.getElementById("form_modal");
    if (creationModal) {
      creationModal.addEventListener("show.bs.modal", function (event) {
        const taskNameInput = document.getElementById("task_name");
        const descriptionInput = document.getElementById("description");

        if (taskNameInput && descriptionInput) {
          taskNameInput.value = "";
          descriptionInput.value = "";
          taskNameInput.classList.remove("green-background");
          descriptionInput.classList.remove("green-background");
        }
      });
    }
  }
  // DUEDATE NOTIFICATION
  if (element.deadline_date && element.deadline_time) {
    const dueDateTime = new Date(
      `${element.deadline_date}T${element.deadline_time}`
    );
    const timeDifference = dueDateTime.getTime() - Date.now(); // Get time difference in milliseconds

    const threshold = 60 * 1000; // Threshold set to one minute (60 seconds) before the due date

    if (timeDifference > 0 && timeDifference <= threshold) {
      showPopupNotification(element.task_name, timeDifference);
    }
  }

  return itemDiv;
}

// Function to show the notification// Function to show the popup notification
function showPopupNotification(taskName, timeDifference) {
  const secondsRemaining = Math.floor(timeDifference / 1000);
  const popupMessage = `Upcoming Task: ${taskName}\nDue in ${secondsRemaining} second${
    secondsRemaining !== 1 ? "s" : ""
  }.`;

  // Show the popup notification using JavaScript's alert function
  alert(popupMessage);
}

//
//
function displayData(data) {
  const getDataDiv = document.getElementById("get_data");
  getDataDiv.innerHTML = "";

  data.forEach((item) => {
    const itemDiv = createCard(item);
    getDataDiv.appendChild(itemDiv);
  });
}

// DELETE FUNCTIONS
async function deleteTask(taskId) {
  try {
    const bearerToken = localStorage.getItem("token");
    const deleteURL = `${backendURL}/api/tasks/${taskId}`;
    console.log("Delete URL:", deleteURL);

    const response = await fetch(deleteURL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    console.log("Response status:", response.status);
    console.log("Response message:", response.statusText);

    if (!response.ok) {
      throw new Error(
        `Failed to delete task with ID ${taskId}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    throw new Error("Failed to fetch data");
  }
}

// SEARCH FUNCTIONS

const searchInput = document.getElementById("searchInput");
const suggestionsContainer = document.getElementById("suggestions");

searchInput.addEventListener("input", async (event) => {
  const userInput = event.target.value.trim();
  suggestionsContainer.innerHTML = ""; // Clear previous suggestions

  if (userInput.length > 0) {
    try {
      const searchSuggestions = await fetchSearchSuggestions(userInput);
      displaySuggestions(searchSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }
});

async function fetchSearchSuggestions(keyword) {
  const url = `${backendURL}/api/tasks?q=${keyword}`;
  const bearerToken = localStorage.getItem("token");

  if (!bearerToken) {
    throw new Error("Token not found");
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(`HTTP-Error: ${response.status}`);
  }
}

//
//
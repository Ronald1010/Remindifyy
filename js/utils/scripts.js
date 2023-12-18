window.addEventListener("DOMContentLoaded", (event) => {
  // na Toggle the sidevigation
  const sidebarToggle = document.body.querySelector("#sidebarToggle");
  if (sidebarToggle) {
    // Uncomment Below to persist sidebar toggle between refreshes
    // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
    //     document.body.classList.toggle('sb-sidenav-toggled');
    // }
    sidebarToggle.addEventListener("click", (event) => {
      event.preventDefault();
      document.body.classList.toggle("sb-sidenav-toggled");
      localStorage.setItem(
        "sb|sidebar-toggle",
        document.body.classList.contains("sb-sidenav-toggled")
      );
    });
  }
});

const editButtons = document.querySelectorAll(".bi-pencil-fill");
editButtons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log("Test button clicked!");
    // Perform other actions for button click here
  });
});

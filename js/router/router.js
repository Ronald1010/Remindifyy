function setRouter() {
  switch (window.location.pathname) {
    // If you are logged in you cant access outside pages; redirect to dashboard
    case "/":
    case "/index.html":
    case "/register.html":
      if (localStorage.getItem("token")) {
        window.location.pathname = "/test.html";
      }
      break;
    // If you are not logged in you cant access dashboard pages; redirect to /
    case "/test.html":
      if (!localStorage.getItem("token")) {
        window.location.pathname = "/";
      }
      break;

    default:
      break;
  }
}

export { setRouter };

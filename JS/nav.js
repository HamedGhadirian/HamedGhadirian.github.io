// Highlights the navigation tab of the page you are on.
document.addEventListener("DOMContentLoaded", function () {
    // The site's root address ("/") is the Portfolio page
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navigation-buttons .nav-button").forEach(button => {
        if (button.getAttribute("href") === currentPage) {
            button.classList.add("active");
        }
    });
});

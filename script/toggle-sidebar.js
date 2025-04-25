document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle-sidebar-button");
  const sidebar = document.getElementById("score-sidebar");
  const closeIcon = document.getElementById("close-sidebar");
  let sidebarOpen = true;

  // Get the sidebar width for button movement calculation
  const sidebarWidth = sidebar.offsetWidth;

  // Set consistent transition duration for both elements
  const transitionDuration = "0.3s";

  // Add transition to both elements for synchronized animation
  toggleButton.style.transition = `transform ${transitionDuration} ease-in-out`;
  sidebar.style.transition = `transform ${transitionDuration} ease-in-out, opacity ${transitionDuration} ease-in-out`;

  // Initialize the sidebar state
  if (window.innerWidth <= 768) {
    sidebar.style.display = "none";
    toggleButton.style.transform = "translateX(0)";
    sidebarOpen = false;
    updateToggleIcon();
  } else {
    // Set initial button position when sidebar is open
    toggleButton.style.transform = `translateX(${sidebarWidth}px)`;
  }

  toggleButton.addEventListener("click", function () {
    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
      sidebar.style.display = "flex";
      setTimeout(() => {
        sidebar.style.transform = "translateX(0)";
        sidebar.style.opacity = "1";
        // Move button along with sidebar
        toggleButton.style.transform = `translateX(${sidebarWidth}px)`;
      }, 10);
    } else {
      sidebar.style.transform = "translateX(-100%)";
      sidebar.style.opacity = "0";
      // Move button back to starting position
      toggleButton.style.transform = "translateX(0)";
      setTimeout(() => {
        sidebar.style.display = "none";
      }, 300); // Match this with the CSS transition duration
    }

    updateToggleIcon();
  });

  function updateToggleIcon() {
    if (sidebarOpen) {
      closeIcon.src = "/img/close-sidebar.png";
      closeIcon.alt = "close sidebar";
    } else {
      closeIcon.src = "/img/open-sidebar.png";
      closeIcon.alt = "open sidebar";
    }
  }

  // Handle window resize events
  window.addEventListener("resize", function () {
    // Recalculate sidebar width on resize
    const updatedSidebarWidth = sidebar.offsetWidth;

    if (window.innerWidth > 768) {
      sidebar.style.display = "flex";
      sidebar.style.transform = "translateX(0)";
      sidebar.style.opacity = "1";
      // Update button position on resize
      toggleButton.style.transform = `translateX(${updatedSidebarWidth}px)`;
      sidebarOpen = true;
      updateToggleIcon();
    } else if (window.innerWidth <= 768 && sidebarOpen) {
      // Keep the current state on small screens
      sidebar.style.display = "flex";
      toggleButton.style.transform = `translateX(${updatedSidebarWidth}px)`;
    } else if (window.innerWidth <= 768 && !sidebarOpen) {
      sidebar.style.display = "none";
      toggleButton.style.transform = "translateX(0)";
    }
  });
});

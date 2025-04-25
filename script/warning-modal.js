document.addEventListener("DOMContentLoaded", function () {
  const warningModal = document.getElementById("instruction-modal");
  const modalCloseButton = document.getElementById("modal-close");
  const toggleSidebarButton = document.getElementById("toggle-sidebar-button");

  warningModal.style.display = "flex";

  // Close modal when close button is clicked
  modalCloseButton.addEventListener("click", () => {
    warningModal.style.display = "none";
  });

  // Close modal when clicking outside of the modal content
  window.addEventListener("click", (event) => {
    if (event.target === warningModal) {
      warningModal.style.display = "none";
    }
  });

  // Also close modal when sidebar is toggled
  toggleSidebarButton.addEventListener("click", () => {
    if (warningModal.style.display === "flex") {
      warningModal.style.display = "none";
    }
  });
});

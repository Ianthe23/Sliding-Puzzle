document.addEventListener("DOMContentLoaded", function () {
  // Feedback form handling
  const feedbackButton = document.getElementById("feedback-button");
  const feedbackModal = document.getElementById("feedback-modal");
  const closeBtn = document.querySelector(".close-btn");
  const feedbackForm = document.getElementById("feedback-form");
  const closeThankYouBtn = document.getElementById("close-thank-you");

  // Open feedback modal when the button is clicked
  feedbackButton.addEventListener("click", () => {
    feedbackModal.style.display = "flex";
  });

  // Close feedback modal when the close button is clicked
  closeBtn.addEventListener("click", () => {
    feedbackModal.style.display = "none";
    // Reset the form if needed
    feedbackForm.reset();
    // Hide thank you message if visible
    feedbackModal.classList.remove("show-thank-you");
  });

  // Close modal when clicking outside of it
  feedbackModal.addEventListener("click", (event) => {
    if (event.target === feedbackModal) {
      feedbackModal.style.display = "none";
      feedbackForm.reset();
      feedbackModal.classList.remove("show-thank-you");
    }
  });

  // Handle form submission
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(feedbackForm);
    const feedbackData = {
      name: formData.get("user-name") || "Anonymous",
      email: formData.get("user-email") || "Not provided",
      type: formData.get("feedback-type"),
      feedback: formData.get("feedback-text"),
      rating: formData.get("rating") || "Not rated",
      timestamp: new Date().toISOString(),
    };

    emailFeedback(feedbackData);

    // Show thank you message
    feedbackModal.classList.add("show-thank-you");

    // Reset form
    feedbackForm.reset();
  });

  // Close thank you message
  closeThankYouBtn.addEventListener("click", () => {
    feedbackModal.style.display = "none";
    feedbackModal.classList.remove("show-thank-you");
  });

  // Function to open email client with feedback
  function emailFeedback(feedbackData) {
    const subject = `Slide Puzzle Game Feedback: ${feedbackData.type}`;
    const body = `
      Name: ${feedbackData.name}
      Email: ${feedbackData.email}
      Type: ${feedbackData.type}
      Rating: ${feedbackData.rating}
      Time: ${feedbackData.timestamp}

      Feedback:${feedbackData.feedback}
    `;

    const mailtoLink = `mailto:ivo.pastin@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  }
});

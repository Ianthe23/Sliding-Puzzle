document.addEventListener("DOMContentLoaded", function () {
  const gameInstructions = document.getElementById("game-instructions");
  const closeInstructions = document.getElementById("close-instructions");

  // Also show game instructions on page load
  setTimeout(() => {
    gameInstructions.style.display = "block";
  }, 500);

  // Add close functionality
  closeInstructions.addEventListener("click", () => {
    gameInstructions.style.display = "none";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  let grid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0],
  ]; // 0 represents the empty space

  let highScores = [];

  // Personal stats management
  let personalStats = {
    gamesPlayed: 0,
    totalMoves: 0,
    totalTimeSeconds: 0,
  };

  let emptyTilePos = { row: 3, col: 3 };
  let gameStarted = false;
  let moveCount = 0;
  let timerInterval;
  let seconds = 0;

  // get the screen size everytime width is resized
  let isMobile = window.matchMedia("(max-width: 768px)").matches;
  window.addEventListener("resize", function () {
    isMobile = window.matchMedia("(max-width: 768px)").matches;
    updateBoard(); // Update board when screen size changes
  });

  const gameBoard = document.getElementById("game-board");
  const pauseButton = document.getElementById("pause-button");
  const shuffleButton = document.getElementById("shuffle-button");
  const resetButton = document.getElementById("reset-button");
  const movesDisplayMobile = document.getElementById("moves-mobile");
  const timerDisplayMobile = document.getElementById("timer-mobile");
  const timerDisplayDesktop = document.getElementById("timer-desktop");
  const movesDisplayDesktop = document.getElementById("moves-desktop");
  const backgroundSelect = document.getElementById("background-select");
  const loaderOverlay = document.getElementById("loader-overlay");
  const scoreList = document.getElementById("score-list");

  loadGameData();

  function updateMovesDisplay(value) {
    if (movesDisplayMobile) movesDisplayMobile.textContent = value;
    if (movesDisplayDesktop) movesDisplayDesktop.textContent = value;
  }

  function updateTimerDisplay(minutes, seconds) {
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    if (timerDisplayMobile) timerDisplayMobile.textContent = formattedTime;
    if (timerDisplayDesktop) timerDisplayDesktop.textContent = formattedTime;
  }

  // High score management
  function loadHighScores() {
    const savedScores = localStorage.getItem("slidePuzzleHighScores");
    if (savedScores) {
      highScores = JSON.parse(savedScores);
    }
  }

  function saveHighScores() {
    localStorage.setItem("slidePuzzleHighScores", JSON.stringify(highScores));
  }

  function displayHighScores() {
    scoreList.innerHTML = "";

    if (highScores.length === 0) {
      console.log("highScores", highScores);
      console.log("No scores yet. Be the first!");
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "No scores yet. Be the first!";
      scoreList.appendChild(emptyItem);
      return;
    }

    highScores.forEach((score, index) => {
      const scoreItem = document.createElement("li");

      const nameSpan = document.createElement("span");
      nameSpan.className = "score-name";
      nameSpan.textContent = score.name;

      const detailsSpan = document.createElement("span");
      detailsSpan.className = "score-details";
      detailsSpan.textContent = `${score.moves} moves in ${score.time}`;

      const puzzleSpan = document.createElement("span");
      puzzleSpan.className = "score-puzzle";
      puzzleSpan.textContent = score.puzzle;

      scoreItem.appendChild(nameSpan);
      scoreItem.appendChild(document.createTextNode(": "));
      scoreItem.appendChild(detailsSpan);
      scoreItem.appendChild(document.createTextNode(" - "));
      scoreItem.appendChild(puzzleSpan);

      scoreList.appendChild(scoreItem);
    });
  }

  function addHighScore(name, moves, time, puzzle) {
    const newScore = {
      name,
      moves,
      time,
      puzzle,
      timestamp: Date.now(),
    };

    highScores.push(newScore);

    // Sort by moves (ascending), then by time (ascending)
    highScores.sort((a, b) => {
      if (a.moves !== b.moves) {
        return a.moves - b.moves;
      }

      // Extract minutes and seconds from the time strings
      const [aMin, aSec] = a.time.split(":").map(Number);
      const [bMin, bSec] = b.time.split(":").map(Number);

      const aTotalSeconds = aMin * 60 + aSec;
      const bTotalSeconds = bMin * 60 + bSec;

      return aTotalSeconds - bTotalSeconds;
    });

    // Keep only top 5
    if (highScores.length > 5) {
      highScores = highScores.slice(0, 5);
    }

    saveHighScores();
    displayHighScores();
  }

  function loadPersonalStats() {
    const savedStats = localStorage.getItem("slidePuzzlePersonalStats");
    if (savedStats) {
      personalStats = JSON.parse(savedStats);

      // Update the UI with stored stats
      updatePersonalStatsUI();
    }
  }

  function savePersonalStats() {
    localStorage.setItem(
      "slidePuzzlePersonalStats",
      JSON.stringify(personalStats)
    );

    // Update the UI with new stats
    updatePersonalStatsUI();
  }

  function updatePersonalStatsUI() {
    // Update the personal stats section in the sidebar
    const totalGamesElement = document.getElementById("total-games");
    const totalMovesElement = document.getElementById("total-moves");
    const totalTimeElement = document.getElementById("total-time");

    // Update text content
    totalGamesElement.textContent = personalStats.gamesPlayed;
    totalMovesElement.textContent = personalStats.totalMoves;
    totalTimeElement.textContent = formatTime(personalStats.totalTimeSeconds);

    // Add animation by applying and removing the class
    [totalGamesElement, totalMovesElement, totalTimeElement].forEach(
      (element) => {
        element.classList.add("stat-update");
        setTimeout(() => {
          element.classList.remove("stat-update");
        }, 500);
      }
    );
  }

  // Load both high scores and personal stats at initialization
  function loadGameData() {
    loadHighScores();
    loadPersonalStats();
    displayHighScores();
  }

  // Add this new function to prevent arrow key scrolling
  function preventArrowKeyScrolling(e) {
    // Arrow keys: up (38), down (40), left (37), right (39)
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
      return false;
    }
  }

  // Initialize the game
  function initGameBoard() {
    // Create empty tile (no img element)
    const emptyTile = document.createElement("div");
    emptyTile.className = "tile empty";
    emptyTile.dataset.row = emptyTilePos.row;
    emptyTile.dataset.col = emptyTilePos.col;
    gameBoard.appendChild(emptyTile);

    // Add click event to all tiles
    const tiles = document.querySelectorAll(".tile:not(.empty)");
    tiles.forEach((tile) => {
      tile.addEventListener("click", () => handleTileClick(tile));
    });

    // Add keyboard event listeners
    document.addEventListener("keydown", handleKeyDown);

    // Add button events
    pauseButton.addEventListener("click", pauseGame);
    shuffleButton.addEventListener("click", shuffleTiles);
    resetButton.addEventListener("click", resetGame);

    // disable pause button if game is not started
    pauseButton.disabled = true;

    // Add background selector event listener
    backgroundSelect.addEventListener("change", changeBackground);

    // Add these event listeners after the existing backgroundSelect listener
    backgroundSelect.addEventListener("focus", function () {
      this.classList.add("active");
    });

    backgroundSelect.addEventListener("blur", function () {
      this.classList.remove("active");
    });

    // Update the board to match the initial grid state
    updateBoard();

    // Check if the puzzle is in its default, solved state
    if (isPuzzleSolved()) {
      // Add visual indication that the puzzle needs to be shuffled
      const instructionText = document.createElement("div");
      instructionText.className = "shuffle-hint";
      instructionText.textContent = "Press 'Shuffle' to start playing!";
      instructionText.style.position = "absolute";
      instructionText.style.top = "10px";
      instructionText.style.left = "50%";
      instructionText.style.transform = "translateX(-50%)";
      instructionText.style.color = "#7d47c3";
      instructionText.style.fontWeight = "bold";
      instructionText.style.textAlign = "center";
      instructionText.style.zIndex = "10";
      instructionText.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
      instructionText.style.padding = "5px 10px";
      instructionText.style.borderRadius = "5px";
      gameBoard.appendChild(instructionText);

      // Make the shuffle button pulse to draw attention
      shuffleButton.classList.add("attention");
    }
  }

  function handleTileClick(tile) {
    // Check if puzzle is already solved - don't allow moves
    if (isPuzzleSolved()) return;

    if (!gameStarted) startGame();

    const tileRow = parseInt(tile.dataset.row);
    const tileCol = parseInt(tile.dataset.col);

    // Check if the clicked tile is adjacent to the empty space
    const isAdjacent =
      (Math.abs(tileRow - emptyTilePos.row) === 1 &&
        tileCol === emptyTilePos.col) ||
      (Math.abs(tileCol - emptyTilePos.col) === 1 &&
        tileRow === emptyTilePos.row);

    if (isAdjacent) moveTile(tile);
  }

  // Add event listener to window to catch all keydown events
  window.addEventListener("keydown", preventArrowKeyScrolling);

  // Handle keyboard arrow keys
  function handleKeyDown(event) {
    // Check if puzzle is already solved - don't allow moves
    if (isPuzzleSolved()) return;

    if (!gameStarted) startGame();

    switch (event.key) {
      case "ArrowUp":
        // Move the tile below the empty space
        if (emptyTilePos.row < 3) {
          const tileToMove = getTileAt(emptyTilePos.row + 1, emptyTilePos.col);
          if (tileToMove) moveTile(tileToMove);
        }
        break;
      case "ArrowDown":
        // Move the tile above the empty space down
        if (emptyTilePos.row > 0) {
          const tileToMove = getTileAt(emptyTilePos.row - 1, emptyTilePos.col);
          if (tileToMove) moveTile(tileToMove);
        }
        break;
      case "ArrowLeft":
        // Move the tile to the right of the empty space
        if (emptyTilePos.col < 3) {
          const tileToMove = getTileAt(emptyTilePos.row, emptyTilePos.col + 1);
          if (tileToMove) moveTile(tileToMove);
        }
        break;
      case "ArrowRight":
        // Move the tile to the left of the empty space
        if (emptyTilePos.col > 0) {
          const tileToMove = getTileAt(emptyTilePos.row, emptyTilePos.col - 1);
          if (tileToMove) moveTile(tileToMove);
        }
        break;
    }
  }

  function pauseGame() {
    if (!gameStarted) {
      // If game hasn't started yet, do nothing
      return;
    }

    if (pauseButton.textContent === "Pause") {
      // Pause the game
      clearInterval(timerInterval);
      pauseButton.textContent = "Resume";
      pauseButton.classList.add("resume-pulse"); // Add pulse animation

      // Disable tile movement when paused
      const tiles = document.querySelectorAll(".tile:not(.empty)");
      tiles.forEach((tile) => {
        tile.style.pointerEvents = "none";
      });
      document.removeEventListener("keydown", handleKeyDown);
    } else {
      // Resume the game
      timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        updateTimerDisplay(minutes, remainingSeconds);
      }, 1000);
      pauseButton.textContent = "Pause";
      pauseButton.classList.remove("resume-pulse"); // Remove pulse animation

      // Re-enable tile movement
      const tiles = document.querySelectorAll(".tile:not(.empty)");
      tiles.forEach((tile) => {
        tile.style.pointerEvents = "auto";
      });
      document.addEventListener("keydown", handleKeyDown);
    }
  }

  function startGame() {
    if (!gameStarted) {
      gameStarted = true;

      moveCount = 0;
      updateMovesDisplay(moveCount);

      clearInterval(timerInterval);
      seconds = 0;
      timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        updateTimerDisplay(minutes, remainingSeconds);
      }, 1000);

      // Enable pause button when game starts
      pauseButton.disabled = false;
      pauseButton.textContent = "Pause";
    }
  }

  function getTileAt(row, col) {
    return document.querySelector(
      `.tile[data-row="${row}"][data-col="${col}"]:not(.empty)`
    );
  }

  function moveTile(tile) {
    const tileRow = parseInt(tile.dataset.row);
    const tileCol = parseInt(tile.dataset.col);
    const tileValue = parseInt(tile.dataset.value || grid[tileRow][tileCol]);

    // Add moving class for animation
    tile.classList.add("moving");

    // Update data attributes
    tile.dataset.row = emptyTilePos.row;
    tile.dataset.col = emptyTilePos.col;

    // Update tile value in dataset if needed
    if (!tile.dataset.value) {
      tile.dataset.value = tileValue;
    }

    // Update game grid
    grid[emptyTilePos.row][emptyTilePos.col] = tileValue;
    grid[tileRow][tileCol] = 0;

    emptyTilePos = { row: tileRow, col: tileCol };

    // Update the empty tile's position
    const emptyTile = document.querySelector(".tile.empty");
    emptyTile.dataset.row = emptyTilePos.row;
    emptyTile.dataset.col = emptyTilePos.col;

    // Increment move count
    moveCount++;
    updateMovesDisplay(moveCount);

    // Update the visual board
    updateBoard();

    // Remove the moving class after animation completes
    setTimeout(() => {
      tile.classList.remove("moving");
    }, 300); // Match this with your CSS transition duration

    // Check if puzzle is solved
    if (isPuzzleSolved()) {
      endGame();
    }
  }

  function updateBoard() {
    const tiles = document.querySelectorAll(".tile");

    // Get computed size from CSS
    const gameBoard = document.getElementById("game-board");
    const computedStyle = window.getComputedStyle(gameBoard);
    const gameboardSize = parseInt(computedStyle.width);

    const tilesPerRow = 4;
    const tileSize = (gameboardSize - (tilesPerRow - 1) * 5) / tilesPerRow; // Smaller gap
    const gap = 5; // Smaller gap for mobile

    // Set the game board height explicitly to contain all absolute-positioned elements
    gameBoard.style.height = gameboardSize + "px";

    // Update all tiles with proper positioning
    tiles.forEach((tile) => {
      const row = parseInt(tile.dataset.row);
      const col = parseInt(tile.dataset.col);

      // Calculate position (considering gaps)
      const topPosition = row * (tileSize + gap);
      const leftPosition = col * (tileSize + gap);

      // Apply position using CSS top/left for animation
      tile.style.top = topPosition + "px";
      tile.style.left = leftPosition + "px";

      // If not the empty tile, update background position
      if (!tile.classList.contains("empty") && tile.dataset.value) {
        const value = parseInt(tile.dataset.value);

        // Set appropriate background size and position
        tile.style.width = tileSize + "px";
        tile.style.height = tileSize + "px";
        tile.style.backgroundSize =
          gameboardSize + "px " + gameboardSize + "px";

        // Calculate the correct background position
        const backgroundRow = Math.floor((value - 1) / 4);
        const backgroundCol = (value - 1) % 4;
        const bgX = -(backgroundCol * tileSize + backgroundCol * gap) + "px";
        const bgY = -(backgroundRow * tileSize + backgroundRow * gap) + "px";
        tile.style.backgroundPosition = bgX + " " + bgY;
      }
    });

    // For mobile layout, ensure game controls are visible by checking if we're in mobile view
    if (window.matchMedia("(max-width: 768px)").matches) {
      // Make sure game-controls-container is positioned properly
      const gameControlsContainer = document.getElementById(
        "game-controls-container"
      );
      if (gameControlsContainer) {
        gameControlsContainer.style.display = "block";
        gameControlsContainer.style.visibility = "visible";
      }
    }
  }

  function shuffleTiles() {
    // Reset the game state
    resetGame();

    // Remove shuffle hint if it exists
    const shuffleHint = document.querySelector(".shuffle-hint");
    if (shuffleHint) {
      shuffleHint.remove();
    }

    // Remove attention class from shuffle button
    shuffleButton.classList.remove("attention");

    const moves = 100;
    for (let i = 0; i < moves; i++) {
      const possibleMoves = [];

      // Find all possible moves (tiles adjacent to the empty space)
      if (emptyTilePos.row > 0)
        possibleMoves.push({
          row: emptyTilePos.row - 1,
          col: emptyTilePos.col,
        });
      if (emptyTilePos.row < 3)
        possibleMoves.push({
          row: emptyTilePos.row + 1,
          col: emptyTilePos.col,
        });
      if (emptyTilePos.col > 0)
        possibleMoves.push({
          row: emptyTilePos.row,
          col: emptyTilePos.col - 1,
        });
      if (emptyTilePos.col < 3)
        possibleMoves.push({
          row: emptyTilePos.row,
          col: emptyTilePos.col + 1,
        });

      // Get a random move
      const randomMove =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const tileToMove = getTileAt(randomMove.row, randomMove.col);

      if (tileToMove) {
        // Swap without counting as a player move
        const tileRow = parseInt(tileToMove.dataset.row);
        const tileCol = parseInt(tileToMove.dataset.col);
        const tileValue = grid[tileRow][tileCol];

        // Update data attributes
        tileToMove.dataset.row = emptyTilePos.row;
        tileToMove.dataset.col = emptyTilePos.col;
        tileToMove.dataset.value = tileValue;

        // Update game grid
        grid[emptyTilePos.row][emptyTilePos.col] = tileValue;
        grid[tileRow][tileCol] = 0;

        // Update the empty tile's position
        emptyTilePos = { row: tileRow, col: tileCol };

        // Update the empty tile in DOM
        const emptyTile = document.querySelector(".tile.empty");
        emptyTile.dataset.row = emptyTilePos.row;
        emptyTile.dataset.col = emptyTilePos.col;
      }
    }

    // Update the visual board
    updateBoard();

    // Start the game
    startGame();

    // Enable pause button
    pauseButton.disabled = false;
    pauseButton.textContent = "Pause";
  }

  function resetGame() {
    // Stop timer
    clearInterval(timerInterval);
    gameStarted = false;
    seconds = 0;
    moveCount = 0;

    // Reset displays
    updateTimerDisplay(0, 0);
    updateMovesDisplay(0);

    // Reset the game grid
    grid = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 0],
    ];

    // Reset the empty tile's position
    emptyTilePos = { row: 3, col: 3 };

    // Update the empty tile's position
    const emptyTile = document.querySelector(".tile.empty");
    emptyTile.dataset.row = emptyTilePos.row;
    emptyTile.dataset.col = emptyTilePos.col;

    // Reset all tiles to original positions
    const tiles = document.querySelectorAll(".tile:not(.empty)");
    let index = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!(row === 3 && col === 3)) {
          // Skip the empty tile position
          const tile = tiles[index];
          tile.dataset.row = row;
          tile.dataset.col = col;
          tile.dataset.value = row * 4 + col + 1; // Set the proper tile value
          index++;
        }
      }
    }

    // Enable tile movement (in case it was disabled by pause)
    tiles.forEach((tile) => {
      tile.style.pointerEvents = "auto";
    });
    document.addEventListener("keydown", handleKeyDown);

    // Disable pause button when game is reset
    pauseButton.disabled = true;
    pauseButton.textContent = "Pause";
    pauseButton.classList.remove("resume-pulse"); // Remove pulse animation

    // Update the visual board
    updateBoard();
  }

  function endGame() {
    // Stop timer
    clearInterval(timerInterval);
    const gameWasStarted = gameStarted;
    gameStarted = false;
    const puzzle = backgroundSelect.value;

    // Format the final time
    const finalTime = formatTime(seconds);

    // Check if the pause button is enabled to disable it
    if (!pauseButton.disabled) {
      pauseButton.disabled = true;
      pauseButton.textContent = "Pause";
    }

    // Update personal stats if game was actually played
    if (gameWasStarted) {
      personalStats.gamesPlayed++;
      personalStats.totalMoves += moveCount;
      personalStats.totalTimeSeconds += seconds;
      savePersonalStats();
    }

    // Display congratulations message
    setTimeout(() => {
      const message = `Congratulations! You solved the puzzle in ${moveCount} moves and ${finalTime}!`;

      // Prompt for player name
      const playerName = prompt(
        message + "\n\nEnter your name for the leaderboard:",
        "Player"
      );

      if (playerName) {
        addHighScore(playerName.substring(0, 15), moveCount, finalTime, puzzle);
      }
    }, 300);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function isPuzzleSolved() {
    const solution = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 0],
    ];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }

    return true;
  }

  function changeBackground() {
    const selectedBackground = backgroundSelect.value;
    const tiles = document.querySelectorAll(".tile:not(.empty)");

    // Define the mapping of dropdown values to image files
    const backgroundImages = {
      default: "img/image9.webp",
      "sakura-forest": "img/image1.webp",
      "torii-gate": "img/image2.webp",
      "city-at-night": "img/image3.webp",
      "balcony-sunset": "img/image4.webp",
      "cherry-tree": "img/image5.webp",
      "city-at-sunset": "img/image6.webp",
      "beautiful-landscape": "img/image7.webp",
      temple: "img/image8.webp",
    };

    // Get the image path for the selected background
    const imagePath =
      backgroundImages[selectedBackground] || backgroundImages["default"];

    // Show the central loader
    loaderOverlay.classList.add("active");

    // Create a temporary image to preload
    const preloadImage = new Image();
    preloadImage.src = imagePath;

    // When the image is loaded, update the tiles and hide the loader
    preloadImage.onload = function () {
      // Update all tiles with the new background
      tiles.forEach((tile) => {
        tile.style.backgroundImage = `url("${imagePath}")`;
      });

      resetGame();

      // Hide the loader after a short delay to ensure smooth transition
      setTimeout(() => {
        loaderOverlay.classList.remove("active");
      }, 300);
    };

    // If image loading fails, still hide  the loader
    preloadImage.onerror = function () {
      console.error("Error loading image:", imagePath);
      loaderOverlay.classList.remove("active");
    };
  }

  initGameBoard();
});

document.addEventListener("DOMContentLoaded", () => {
  // Game variables
  let grid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0],
  ]; // 0 represents the empty space

  let emptyTilePos = { row: 3, col: 3 };
  let moveCount = 0;
  let timerInterval;
  let seconds = 0;
  let gameStarted = false;

  // DOM elements
  const gameBoard = document.getElementById("game-board");
  const shuffleButton = document.getElementById("shuffle-button");
  const resetButton = document.getElementById("reset-button");
  const movesDisplay = document.getElementById("moves");
  const timerDisplay = document.getElementById("timer");

  // Initialize the game
  function initGame() {
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

    // Add button evemts
    shuffleButton.addEventListener("click", shuffleTiles);
    resetButton.addEventListener("click", resetGame);

    // Update the board to match the initial grid state
    updateBoard();
  }

  function handleTileClick(tile) {
    if (!gameStarted) startGame();

    const tileRow = parseInt(tile.dataset.row);
    const tileCol = parseInt(tile.dataset.col);

    // Check if the clikcked tile is adjacent to the empty space
    const isAdjacent =
      (Math.abs(tileRow - emptyTilePos.row) === 1 &&
        tileCol === emptyTilePos.col) ||
      (Math.abs(tileCol - emptyTilePos.col) === 1 &&
        tileRow === emptyTilePos.row);

    if (isAdjacent) moveTile(tile);
  }

  // Handle keyboard arrow keys
  function handleKeyDown(event) {
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

  function startGame() {
    if (!gameStarted) {
      gameStarted = true;

      moveCount = 0;
      movesDisplay.textContent = moveCount;

      clearInterval(timerInterval);
      seconds = 0;
      timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
      }, 1000);
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

    // Update data attributes
    tile.dataset.row = emptyTilePos.row;
    tile.dataset.col = emptyTilePos.col;

    // Update game grid
    const tileValue = grid[tileRow][tileCol];
    grid[emptyTilePos.row][emptyTilePos.col] = tileValue;
    grid[tileRow][tileCol] = 0;

    // Update the empty tile position
    emptyTilePos.row = tileRow;
    emptyTilePos.col = tileCol;

    // Update the empty tile's position
    const emptyTile = document.querySelector(".empty");
    emptyTile.dataset.row = emptyTilePos.row;
    emptyTile.dataset.col = emptyTilePos.col;

    // Increment move count
    moveCount++;
    movesDisplay.textContent = moveCount;

    // Update the visual board
    updateBoard();

    // Check if puzzle is solved
    if (isPuzzleSolved()) {
      endGame();
    }
  }

  function updateBoard() {
    const tiles = document.querySelectorAll(".tile");
    tiles.forEach((tile) => {
      const row = parseInt(tile.dataset.row);
      const col = parseInt(tile.dataset.col);
      tile.style.gridRow = row + 1;
      tile.style.gridColumn = col + 1;
    });
  }

  function shuffleTiles() {
    // Reset the game state
    resetGame();

    const moves = 100;
    for (let i = 0; i < moves; i++) {
      const possibleMoves = [];

      // Find all possible moves(tiles adjacent to the empty space)
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

      // Swap without counting as a player move
      const tileRow = parseInt(tileToMove.dataset.row);
      const tileCol = parseInt(tileToMove.dataset.col);

      // Update data attributes
      tileToMove.dataset.row = emptyTilePos.row;
      tileToMove.dataset.col = emptyTilePos.col;

      // Update game grid
      grid[emptyTilePos.row][emptyTilePos.col] = grid[tileRow][tileCol];
      grid[tileRow][tileCol] = 0;

      // Update the empty tile's position
      emptyTilePos.row = tileRow;
      emptyTilePos.col = tileCol;

      // Update the empty tile's position
      const emptyTile = document.querySelector(".empty");
      emptyTile.dataset.row = emptyTilePos.row;
      emptyTile.dataset.col = emptyTilePos.col;
    }

    // Update the visual board
    updateBoard();

    // Start the game
    startGame();
  }

  function resetGame() {
    // Stop timer
    clearInterval(timerInterval);
    gameStarted = false;
    seconds = 0;
    moveCount = 0;

    // Reset displays
    timerDisplay.textContent = "00:00";
    movesDisplay.textContent = 0;

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
    const emptyTile = document.querySelector(".empty");
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
          index++;
        }
      }
    }

    // Update the visual board
    updateBoard();
  }

  function endGame() {
    // Stop timer
    clearInterval(timerInterval);
    gameStarted = false;

    // Display congratulations message (you could uncomment and use the game-message div)
    setTimeout(() => {
      alert(
        `Congratulations! You solved the puzzle in ${moveCount} moves and ${formatTime(
          seconds
        )}!`
      );
    }, 300);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
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

  initGame();
});

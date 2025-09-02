$(document).ready(function () {
  // Game state
  let gameBoard = [];
  let playerSymbol = "";
  let selectedCard = null;
  let gameActive = true;
  let movesInRound = 0;
  let currentVectors = [];
  let usedCardIndices = [];
  let roundNumber = 0;
  let totalRounds = 0;
  let totalTris = 0;
  let lastVectorPair = null; // Track the last vector pair to avoid repetition
  let trisDetected = false; // Track if a tris has been detected in the current round
  let trisCount = 0; // Track the number of tris detected in the current round
  let highlightedTris = []; // Track currently highlighted tris positions

  // Vector definitions
  const vectors = {
    i: [1, 0, 0],
    "-i": [-1, 0, 0],
    j: [0, 1, 0],
    "-j": [0, -1, 0],
    k: [0, 0, 1],
    "-k": [0, 0, -1],
    0: [0, 0, 0],
  };

  const vectorSymbols = ["i", "-i", "j", "-j", "k", "-k"];

  // Vector color mapping
  const vectorColors = {
    i: "#3498db",
    "-i": "#2980b9",
    j: "#2ecc71",
    "-j": "#27ae60",
    k: "#e74c3c",
    "-k": "#c0392b",
    0: "#95a5a6",
  };

  // Vector class mapping
  const vectorClasses = {
    i: "vector-i",
    "-i": "vector-neg-i",
    j: "vector-j",
    "-j": "vector-neg-j",
    k: "vector-k",
    "-k": "vector-neg-k",
    0: "vector-zero",
  };

  // Helper function to get the color class for a vector
  function getVectorColorClass(vector) {
    return vectorClasses[vector] || "vector-zero";
  }

  // Helper function to get the color for a vector
  function getVectorColor(vector) {
    return vectorColors[vector] || "#95a5a6";
  }

  // Helper function to shuffle an array (Fisher-Yates algorithm)
  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Helper function to get a random vector symbol
  function getRandomVectorSymbol() {
    const randomIndex = Math.floor(Math.random() * vectorSymbols.length);
    return vectorSymbols[randomIndex];
  }

  // Check if the board has any tris (three in a row) of any symbol
  function hasAnyTris(board) {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (
        board[i][0] !== "" &&
        board[i][0] === board[i][1] &&
        board[i][1] === board[i][2]
      ) {
        return true;
      }
    }

    // Check columns
    for (let j = 0; j < 3; j++) {
      if (
        board[0][j] !== "" &&
        board[0][j] === board[1][j] &&
        board[1][j] === board[2][j]
      ) {
        return true;
      }
    }

    // Check diagonals
    if (
      board[0][0] !== "" &&
      board[0][0] === board[1][1] &&
      board[1][1] === board[2][2]
    ) {
      return true;
    }

    if (
      board[0][2] !== "" &&
      board[0][2] === board[1][1] &&
      board[1][1] === board[2][0]
    ) {
      return true;
    }

    return false;
  }

  // Check for tris and return the positions
  function findTrisPositions(board, symbol) {
    const positions = [];

    // Check rows
    for (let i = 0; i < 3; i++) {
      if (
        board[i][0] === symbol &&
        board[i][1] === symbol &&
        board[i][2] === symbol
      ) {
        positions.push(
          { row: i, col: 0 },
          { row: i, col: 1 },
          { row: i, col: 2 }
        );
        return positions;
      }
    }

    // Check columns
    for (let j = 0; j < 3; j++) {
      if (
        board[0][j] === symbol &&
        board[1][j] === symbol &&
        board[2][j] === symbol
      ) {
        positions.push(
          { row: 0, col: j },
          { row: 1, col: j },
          { row: 2, col: j }
        );
        return positions;
      }
    }

    // Check diagonals
    if (
      board[0][0] === symbol &&
      board[1][1] === symbol &&
      board[2][2] === symbol
    ) {
      positions.push(
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 }
      );
      return positions;
    }

    if (
      board[0][2] === symbol &&
      board[1][1] === symbol &&
      board[2][0] === symbol
    ) {
      positions.push(
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 }
      );
      return positions;
    }

    return positions;
  }

  // Find all tris positions for a symbol
  function findAllTrisPositions(board, symbol) {
    const allPositions = [];

    // Check rows
    for (let i = 0; i < 3; i++) {
      if (
        board[i][0] === symbol &&
        board[i][1] === symbol &&
        board[i][2] === symbol
      ) {
        allPositions.push([
          { row: i, col: 0 },
          { row: i, col: 1 },
          { row: i, col: 2 },
        ]);
      }
    }

    // Check columns
    for (let j = 0; j < 3; j++) {
      if (
        board[0][j] === symbol &&
        board[1][j] === symbol &&
        board[2][j] === symbol
      ) {
        allPositions.push([
          { row: 0, col: j },
          { row: 1, col: j },
          { row: 2, col: j },
        ]);
      }
    }

    // Check diagonals
    if (
      board[0][0] === symbol &&
      board[1][1] === symbol &&
      board[2][2] === symbol
    ) {
      allPositions.push([
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ]);
    }

    if (
      board[0][2] === symbol &&
      board[1][1] === symbol &&
      board[2][0] === symbol
    ) {
      allPositions.push([
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 },
      ]);
    }

    return allPositions;
  }

  // Generate a balanced initial board with no tris
  function generateBalancedBoard() {
    let board;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      // Create a pool of symbols: one of each non-zero vector plus 3 more random non-zero vectors
      let pool = [...vectorSymbols];

      // Add 3 more non-zero vectors randomly
      for (let i = 0; i < 3; i++) {
        const randomSymbol = getRandomVectorSymbol();
        pool.push(randomSymbol);
      }

      // Shuffle the pool
      pool = shuffleArray(pool);

      // Create a 3x3 board from the shuffled pool
      board = [];
      let index = 0;
      for (let i = 0; i < 3; i++) {
        board[i] = [];
        for (let j = 0; j < 3; j++) {
          board[i][j] = pool[index++];
        }
      }

      attempts++;
    } while (hasAnyTris(board) && attempts < maxAttempts);

    return board;
  }

  // Initialize the game
  function initGame() {
    // Reset game state
    gameActive = true;
    movesInRound = 0;
    selectedCard = null;
    currentVectors = [];
    usedCardIndices = [];
    roundNumber = 0;
    totalRounds = 0;
    totalTris = 0;
    lastVectorPair = null;
    trisDetected = false;
    trisCount = 0;
    highlightedTris = [];

    // Generate balanced board with no tris
    gameBoard = generateBalancedBoard();

    // Assign player symbol (ensuring it's not overrepresented)
    const symbolCounts = {};
    vectorSymbols.forEach((symbol) => (symbolCounts[symbol] = 0));

    // Count occurrences of each symbol on the board
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        symbolCounts[gameBoard[i][j]]++;
      }
    }

    // Find symbols with minimum count
    const minCount = Math.min(...vectorSymbols.map((s) => symbolCounts[s]));
    const candidateSymbols = vectorSymbols.filter(
      (s) => symbolCounts[s] === minCount
    );

    // Randomly select player symbol from candidates
    playerSymbol =
      candidateSymbols[Math.floor(Math.random() * candidateSymbols.length)];

    // Update UI
    renderBoard();
    updatePlayerInfo();
    generateNewVectors();
    updateMessage(
      "Welcome to 3D Vector Tris! Select one of your cards in the round."
    );

    // Generate vector legend
    generateVectorLegend();
  }

  // Generate vector legend
  function generateVectorLegend() {
    const legendContainer = document.getElementById("vectorLegend");
    legendContainer.innerHTML = "";

    // Create legend items for each vector
    const allVectors = ["i", "-i", "j", "-j", "k", "-k", "0"];
    allVectors.forEach((vector) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";

      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.backgroundColor = getVectorColor(vector);

      const label = document.createElement("span");
      label.textContent = vector;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legendContainer.appendChild(legendItem);
    });
  }

  // Render the game board
  function renderBoard() {
    const boardElement = document.getElementById("gameBoard");
    boardElement.innerHTML = "";

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = i;
        cell.dataset.col = j;

        // Add color class based on vector
        const colorClass = getVectorColorClass(gameBoard[i][j]);
        cell.classList.add(colorClass);

        cell.textContent = gameBoard[i][j];
        cell.addEventListener("click", handleCellClick);
        boardElement.appendChild(cell);
      }
    }
  }

  // Check for tris and highlight if found
  function checkForTrisAndHighlight() {
    // Remove any existing tris highlights
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.classList.remove("tris-cell");
    });

    // Find all tris positions for the player's symbol
    const allTrisPositions = findAllTrisPositions(gameBoard, playerSymbol);

    // Check if we found any tris
    if (allTrisPositions.length > 0) {
      // Highlight all tris cells
      allTrisPositions.forEach((tris) => {
        tris.forEach((pos) => {
          const cell = document.querySelector(
            `.cell[data-row="${pos.row}"][data-col="${pos.col}"]`
          );
          if (cell) {
            cell.classList.add("tris-cell");
          }
        });
      });

      // Update tris count if it's a new tris
      if (allTrisPositions.length > trisCount) {
        trisCount = allTrisPositions.length;

        // Set tris detected flag
        trisDetected = true;

        // Update message based on tris count
        if (movesInRound < 2) {
          if (trisCount === 1) {
            updateMessage(
              "TRIS detected! Complete your second move to finish the round."
            );
          } else if (trisCount === 2) {
            updateMessage(
              "Brilliant! You got a second TRIS! Complete your second move."
            );
          }
        }
      }

      // Store the highlighted tris positions
      highlightedTris = allTrisPositions;

      return true;
    } else {
      // Reset tris detected flag if no tris found
      trisDetected = false;
      trisCount = 0;
      highlightedTris = [];
      return false;
    }
  }

  // Update player info
  function updatePlayerInfo() {
    document.getElementById(
      "playerSymbol"
    ).textContent = `Your symbol: ${playerSymbol}`;
    document.getElementById("gameStatus").textContent = gameActive
      ? "Game in progress"
      : "Game over";
    document.getElementById(
      "totalRounds"
    ).textContent = `Total Rounds: ${totalRounds}`;
    document.getElementById(
      "totalTris"
    ).textContent = `Total Tris: ${totalTris}`;
  }

  // Generate new vectors for the round
  function generateNewVectors() {
    roundNumber++;
    totalRounds++;
    updatePlayerInfo();

    let firstVector, secondVector, pairKey;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      // Generate first vector
      firstVector = getRandomVectorSymbol();

      // Generate second vector, ensuring it's different from the first
      do {
        secondVector = getRandomVectorSymbol();
      } while (secondVector === firstVector);

      // Create a sorted key for the pair to avoid order mattering
      pairKey = [firstVector, secondVector].sort().join(",");

      attempts++;
    } while (pairKey === lastVectorPair && attempts < maxAttempts);

    // Update the last vector pair
    lastVectorPair = pairKey;

    currentVectors = [firstVector, secondVector];
    usedCardIndices = [];
    trisDetected = false; // Reset tris detection for new round
    trisCount = 0; // Reset tris count for new round
    highlightedTris = []; // Reset highlighted tris for new round

    updateVectorsDisplay();
    renderCurrentCards();
  }

  // Update vectors display
  function updateVectorsDisplay() {
    document.getElementById(
      "vectorsDisplay"
    ).textContent = `Current round vectors: ${currentVectors[0]} and ${currentVectors[1]}`;
  }

  // Render current round cards
  function renderCurrentCards() {
    const cardSelection = document.getElementById("cardSelection");
    cardSelection.innerHTML = "";

    currentVectors.forEach((vector, index) => {
      const card = document.createElement("button");
      card.className = "card";
      card.dataset.vector = vector;
      card.dataset.index = index;
      card.textContent = vector;

      // Apply vector color to card
      card.style.backgroundColor = getVectorColor(vector);

      if (usedCardIndices.includes(index)) {
        card.classList.add("used");
        card.disabled = true;
      }

      card.addEventListener("click", handleCardClick);
      cardSelection.appendChild(card);
    });
  }

  // Update message area
  function updateMessage(message) {
    document.getElementById("messageArea").textContent = message;
  }

  // Handle card selection
  function handleCardClick(event) {
    if (!gameActive) return;

    const vector = event.target.dataset.vector;
    const index = parseInt(event.target.dataset.index);

    // Remove previous selection
    document.querySelectorAll(".card").forEach((c) => {
      c.classList.remove("selected");
      // Restore original color
      const originalVector = c.dataset.vector;
      c.style.backgroundColor = getVectorColor(originalVector);
    });

    // Select new card
    event.target.classList.add("selected");
    // Make selected card stand out with a brighter color
    event.target.style.backgroundColor = "#f1c40f";

    selectedCard = {
      vector: vector,
      index: index,
    };
    updateMessage(`Selected card: ${vector}. Now select a cell.`);
  }

  // Handle cell click
  function handleCellClick(event) {
    if (!gameActive || !selectedCard) {
      updateMessage("Please select a card first!");
      return;
    }

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    // Calculate vector product
    const currentVector = gameBoard[row][col];
    const newVector = vectorProduct(selectedCard.vector, currentVector);

    // Update board
    gameBoard[row][col] = newVector;
    renderBoard();

    // Check for tris after this move
    checkForTrisAndHighlight();

    // Mark card as used by its index
    usedCardIndices.push(selectedCard.index);
    renderCurrentCards();
    selectedCard = null;

    movesInRound++;

    if (movesInRound >= 2) {
      // Check for win at the end of the round
      if (trisDetected) {
        gameActive = false;
        totalTris += trisCount; // Add the number of tris found in this round
        updatePlayerInfo();

        // Show appropriate message based on number of tris
        if (trisCount === 1) {
          updateMessage("Well done! You've got a TRIS!");
        } else if (trisCount === 2) {
          updateMessage("Amazing! You got two TRIS in one round!");
        }
        return;
      }

      // Reset for next round
      movesInRound = 0;
      generateNewVectors();
      updateMessage(
        "Round complete! New vectors generated. Select one of your cards in the round."
      );
    } else {
      // If tris was detected after first move, inform player
      if (trisDetected) {
        if (trisCount === 1) {
          updateMessage(
            "TRIS detected! Complete your second move to finish the round."
          );
        } else if (trisCount === 2) {
          updateMessage(
            "Brilliant! You got a second TRIS! Complete your second move."
          );
        }
      } else {
        updateMessage(
          `Move ${
            movesInRound + 1
          } of 2 in this round. Select another card and cell.`
        );
      }
    }
  }

  // Vector product calculation
  function vectorProduct(v1, v2) {
    // Get the vector values
    const v1Value = vectors[v1];
    const v2Value = vectors[v2];

    // Compute the vector product
    const x = v1Value[1] * v2Value[2] - v1Value[2] * v2Value[1];
    const y = v1Value[2] * v2Value[0] - v1Value[0] * v2Value[2];
    const z = v1Value[0] * v2Value[1] - v1Value[1] * v2Value[0];

    // Determine the output vector
    if (x === 0 && y === 0 && z === 0) return "0";
    if (x === 1 && y === 0 && z === 0) return "i";
    if (x === -1 && y === 0 && z === 0) return "-i";
    if (x === 0 && y === 1 && z === 0) return "j";
    if (x === 0 && y === -1 && z === 0) return "-j";
    if (x === 0 && y === 0 && z === 1) return "k";
    if (x === 0 && y === 0 && z === -1) return "-k";

    return "0"; // Default case
  }

  // Check for tris
  function checkMatrixForSymbol(board, symbol) {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (
        board[i][0] === symbol &&
        board[i][1] === symbol &&
        board[i][2] === symbol
      ) {
        return true;
      }
    }

    // Check columns
    for (let j = 0; j < 3; j++) {
      if (
        board[0][j] === symbol &&
        board[1][j] === symbol &&
        board[2][j] === symbol
      ) {
        return true;
      }
    }

    // Check diagonals
    if (
      board[0][0] === symbol &&
      board[1][1] === symbol &&
      board[2][2] === symbol
    ) {
      return true;
    }

    if (
      board[0][2] === symbol &&
      board[1][1] === symbol &&
      board[2][0] === symbol
    ) {
      return true;
    }

    return false;
  }

  // Restart button
  document.getElementById("restartBtn").addEventListener("click", initGame);

  // Start the game
  initGame();
});

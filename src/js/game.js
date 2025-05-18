import { generateCards, shuffleArray } from './utils.js';
import { updateGameUI, showWinModal, updateTimerDisplay } from './ui.js';

// Game state
const gameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 0,
  moves: 0,
  gameActive: false,
  difficulty: 'easy', // easy, medium, hard
  timer: null,
  startTime: null,
  elapsedTime: 0,
  bestScores: {
    easy: [],
    medium: [],
    hard: []
  }
};

// Difficulty settings
const difficultySettings = {
  easy: { pairs: 8, columns: 4 },
  medium: { pairs: 12, columns: 5 },
  hard: { pairs: 18, columns: 6 }
};

// Initialize the game
export function initGame() {
  loadBestScores();
  setupEventListeners();
  startGame();
}

// Set up event listeners
function setupEventListeners() {
  // Difficulty buttons
  document.querySelectorAll('.difficulty-btn').forEach(button => {
    button.addEventListener('click', () => {
      const difficulty = button.dataset.difficulty;
      setDifficulty(difficulty);
      resetGame();
      startGame();
    });
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    resetGame();
    startGame();
  });
}

// Start the game
export function startGame() {
  const { pairs } = difficultySettings[gameState.difficulty];
  gameState.totalPairs = pairs;
  gameState.gameActive = true;
  gameState.matchedPairs = 0;
  gameState.moves = 0;
  gameState.flippedCards = [];
  gameState.startTime = Date.now();
  gameState.elapsedTime = 0;
  
  // Generate and shuffle cards
  gameState.cards = generateCards(pairs);
  
  // Start the timer
  startTimer();
  
  // Update UI
  updateGameUI(gameState);
}

// Handle card click
export function handleCardClick(cardId) {
  // Get the card
  const card = gameState.cards.find(card => card.id === cardId);
  
  // Check if the game is active and the card can be flipped
  if (!gameState.gameActive || 
      card.isMatched || 
      card.isFlipped || 
      gameState.flippedCards.length >= 2) {
    return;
  }
  
  // Flip the card
  card.isFlipped = true;
  gameState.flippedCards.push(card);
  
  // Check if two cards are flipped
  if (gameState.flippedCards.length === 2) {
    gameState.moves++;
    checkForMatch();
  }
  
  // Update UI
  updateGameUI(gameState);
}

// Check if the flipped cards match
function checkForMatch() {
  const [card1, card2] = gameState.flippedCards;
  
  if (card1.symbol === card2.symbol) {
    // Match found
    card1.isMatched = true;
    card2.isMatched = true;
    gameState.matchedPairs++;
    gameState.flippedCards = [];
    
    // Check if all pairs are matched
    if (gameState.matchedPairs === gameState.totalPairs) {
      gameWon();
    }
  } else {
    // No match, flip cards back after a delay
    setTimeout(() => {
      card1.isFlipped = false;
      card2.isFlipped = false;
      gameState.flippedCards = [];
      updateGameUI(gameState);
    }, 1000);
  }
}

// Game won
function gameWon() {
  gameState.gameActive = false;
  stopTimer();
  
  // Calculate score
  const score = calculateScore();
  
  // Update best scores
  updateBestScores(score);
  
  // Show win modal
  showWinModal(gameState, score);
}

// Calculate score
function calculateScore() {
  // Basic score formula: (totalPairs * 100) - (moves * 5) + (time bonus)
  const baseScore = gameState.totalPairs * 100;
  const movesPenalty = gameState.moves * 5;
  
  // Time bonus decreases as time increases
  const maxTimeBonus = 500;
  const maxTime = gameState.totalPairs * 10; // Expected time in seconds
  const timeBonus = Math.max(0, maxTimeBonus - (gameState.elapsedTime / 1000) * (maxTimeBonus / maxTime));
  
  return Math.max(0, Math.floor(baseScore - movesPenalty + timeBonus));
}

// Reset the game
export function resetGame() {
  stopTimer();
  gameState.cards = [];
  gameState.flippedCards = [];
  gameState.matchedPairs = 0;
  gameState.moves = 0;
  gameState.gameActive = false;
  gameState.elapsedTime = 0;
}

// Start the timer
function startTimer() {
  stopTimer();
  gameState.startTime = Date.now();
  gameState.timer = setInterval(() => {
    gameState.elapsedTime = Date.now() - gameState.startTime;
    updateTimerDisplay(gameState.elapsedTime);
  }, 1000);
}

// Stop the timer
function stopTimer() {
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
}

// Set difficulty
function setDifficulty(difficulty) {
  if (['easy', 'medium', 'hard'].includes(difficulty)) {
    gameState.difficulty = difficulty;
    
    // Update active button
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
    
    // Update game board class
    const gameBoard = document.querySelector('.game-board');
    gameBoard.className = `game-board ${difficulty}`;
  }
}

// Update best scores
function updateBestScores(score) {
  const difficulty = gameState.difficulty;
  const scoreData = {
    score,
    moves: gameState.moves,
    time: gameState.elapsedTime,
    date: new Date().toISOString()
  };
  
  // Add new score
  gameState.bestScores[difficulty].push(scoreData);
  
  // Sort scores
  gameState.bestScores[difficulty].sort((a, b) => b.score - a.score);
  
  // Keep only top 5
  gameState.bestScores[difficulty] = gameState.bestScores[difficulty].slice(0, 5);
  
  // Save to local storage
  saveBestScores();
}

// Save best scores to local storage
function saveBestScores() {
  try {
    localStorage.setItem('memoryGame.bestScores', JSON.stringify(gameState.bestScores));
  } catch (error) {
    console.error('Failed to save best scores:', error);
  }
}

// Load best scores from local storage
function loadBestScores() {
  try {
    const savedScores = localStorage.getItem('memoryGame.bestScores');
    if (savedScores) {
      gameState.bestScores = JSON.parse(savedScores);
    }
  } catch (error) {
    console.error('Failed to load best scores:', error);
  }
}

// Export game state and functions
export { gameState, difficultySettings };
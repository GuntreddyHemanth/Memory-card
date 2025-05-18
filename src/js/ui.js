import { handleCardClick, gameState, difficultySettings } from './game.js';
import { formatTime } from './utils.js';

// Create the initial game UI
export function createGameUI() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="header">
      <h1>Memory Match</h1>
      <p class="description">Test your memory by matching pairs of cards. The faster you match with fewer moves, the higher your score!</p>
      
      <div class="game-info">
        <div class="info-item" id="moves">Moves: 0</div>
        <div class="info-item" id="timer">Time: 00:00</div>
        <div class="info-item" id="matches">Matches: 0/0</div>
      </div>
      
      <div class="difficulty-controls">
        <button class="difficulty-btn active" data-difficulty="easy">Easy</button>
        <button class="difficulty-btn" data-difficulty="medium">Medium</button>
        <button class="difficulty-btn" data-difficulty="hard">Hard</button>
        <button id="reset-btn" class="secondary">Reset</button>
      </div>
    </div>
    
    <div class="game-board easy"></div>
    
    <div class="best-scores">
      <h2>Best Scores</h2>
      <div id="scores-table"></div>
    </div>
    
    <div class="modal" id="win-modal">
      <div class="modal-content">
        <h2>Congratulations!</h2>
        <p>You've matched all the cards!</p>
        
        <div class="stats">
          <div class="stat-item">
            <div>Moves</div>
            <div class="stat-value" id="modal-moves">0</div>
          </div>
          <div class="stat-item">
            <div>Time</div>
            <div class="stat-value" id="modal-time">00:00</div>
          </div>
          <div class="stat-item">
            <div>Score</div>
            <div class="stat-value" id="modal-score">0</div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button id="play-again-btn">Play Again</button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listener for play again button
  document.getElementById('play-again-btn').addEventListener('click', () => {
    hideWinModal();
    // The game is reset and restarted when a difficulty button is clicked
    document.querySelector('.difficulty-btn.active').click();
  });
  
  // Render best scores
  renderBestScores();
}

// Update the game UI
export function updateGameUI(state) {
  // Update info displays
  document.getElementById('moves').textContent = `Moves: ${state.moves}`;
  document.getElementById('matches').textContent = `Matches: ${state.matchedPairs}/${state.totalPairs}`;
  
  // Update game board
  const gameBoard = document.querySelector('.game-board');
  renderGameBoard(gameBoard, state.cards);
  
  // Update best scores table
  renderBestScores();
}

// Render the game board
function renderGameBoard(gameBoard, cards) {
  // Clear the game board
  gameBoard.innerHTML = '';
  
  // Add cards to the game board
  cards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = `card${card.isFlipped ? ' flipped' : ''}${card.isMatched ? ' matched' : ''}`;
    cardElement.dataset.id = card.id;
    
    cardElement.innerHTML = `
      <div class="card-front">${card.symbol}</div>
      <div class="card-back">?</div>
    `;
    
    cardElement.addEventListener('click', () => {
      handleCardClick(card.id);
    });
    
    gameBoard.appendChild(cardElement);
  });
}

// Update timer display
export function updateTimerDisplay(timeInMilliseconds) {
  const timerElement = document.getElementById('timer');
  timerElement.textContent = `Time: ${formatTime(timeInMilliseconds)}`;
}

// Show win modal
export function showWinModal(state, score) {
  const modal = document.getElementById('win-modal');
  
  // Update stats
  document.getElementById('modal-moves').textContent = state.moves;
  document.getElementById('modal-time').textContent = formatTime(state.elapsedTime);
  document.getElementById('modal-score').textContent = score;
  
  // Show the modal with animation
  modal.classList.add('visible');
  
  // Create confetti effect
  createConfetti();
  
  // Add event listener to play again button
  document.getElementById('play-again-btn').addEventListener('click', hideWinModal);
}

// Hide win modal
function hideWinModal() {
  const modal = document.getElementById('win-modal');
  modal.classList.remove('visible');
}

// Create confetti effect
function createConfetti() {
  const confettiCount = 100;
  const container = document.body;
  const colors = ['#FFD166', '#4A6DE5', '#4CB963', '#F25F5C', '#9C6ADE'];
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random properties
    const size = Math.random() * 10 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * window.innerWidth;
    const angle = Math.random() * 360;
    const animDuration = Math.random() * 2 + 2;
    
    // Apply styles
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = `${left}px`;
    confetti.style.top = '-10px';
    confetti.style.transform = `rotate(${angle}deg)`;
    confetti.style.animation = `fall ${animDuration}s ease-in forwards`;
    
    // Add keyframe animation
    const keyframes = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(${angle + 720}deg);
          opacity: 0;
        }
      }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
    
    // Add to container
    container.appendChild(confetti);
    
    // Remove after animation completes
    setTimeout(() => {
      confetti.remove();
      styleSheet.remove();
    }, animDuration * 1000);
  }
}

// Render best scores
function renderBestScores() {
  const scoresTableElement = document.getElementById('scores-table');
  const difficulty = gameState.difficulty;
  const scores = gameState.bestScores[difficulty];
  
  if (scores.length === 0) {
    scoresTableElement.innerHTML = '<div class="no-scores">No scores yet. Play a game to set a record!</div>';
    return;
  }
  
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Score</th>
          <th>Moves</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  scores.forEach((scoreData, index) => {
    tableHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${scoreData.score}</td>
        <td>${scoreData.moves}</td>
        <td>${formatTime(scoreData.time)}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  scoresTableElement.innerHTML = tableHTML;
}
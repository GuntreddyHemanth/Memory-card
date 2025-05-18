import './style.css';
import { initGame } from './js/game.js';
import { createGameUI } from './js/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Create the game UI
  createGameUI();
  
  // Initialize the game
  initGame();
});
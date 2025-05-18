// Array of possible card symbols
const symbols = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🦄', '🦋', '🐢', '🐬', '🐙', '🦀', '🦐', '🐳'
];

// Generate a set of card pairs
export function generateCards(numPairs) {
  // Select symbols for the game
  const gameSymbols = [...symbols].slice(0, numPairs);
  
  // Create pairs of cards
  const cards = [];
  gameSymbols.forEach((symbol, index) => {
    // Create first card of the pair
    cards.push({
      id: `card-${index}-a`,
      symbol,
      isFlipped: false,
      isMatched: false
    });
    
    // Create second card of the pair
    cards.push({
      id: `card-${index}-b`,
      symbol,
      isFlipped: false,
      isMatched: false
    });
  });
  
  // Shuffle the cards
  return shuffleArray(cards);
}

// Shuffle an array (Fisher-Yates algorithm)
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Format time (milliseconds to MM:SS format)
export function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
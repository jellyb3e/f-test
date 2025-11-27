export interface GameState {
  currentScene: string;
}

export function save(state: Partial<GameState>) {
  const newState = { ...load(), ...state };
  localStorage.setItem('gameState', JSON.stringify(newState));
}

export function load(): GameState {
  const savedState = localStorage.getItem('gameState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return { currentScene: 'Room2' }; // DEFAULT / START SCENE
}

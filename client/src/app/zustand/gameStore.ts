import { create } from "zustand";

interface GameStore {
  gameCode: string
  locations: string[]
  numberAssassins: number
  numberTasks: number
  timeBetweenTasks: number
  townhallTime: number
  setGameState: (updates: Partial<GameStore>) => void;
  resetGameState: () => void;
}

const initialGameState = {
  gameCode: "",
  locations: [],
  numberAssassins: 0,
  numberTasks: 0,
  timeBetweenTasks: 0,
  townhallTime: 0
};

const useGameStore = create<GameStore>((set) => ({
  ...initialGameState,

  setGameState: (updates) => set(updates),
  resetGameState: () => set(() => ({ ...initialGameState })),
}));

export default useGameStore;
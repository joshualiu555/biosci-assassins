import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameStore {
  gameCode: string;
  locations: string[];
  numberAssassins: number;
  numberTasks: number;
  timeBetweenTasks: number;
  townhallTime: number;
  setGameState: (updates: Partial<GameStore>) => void;
  resetGameState: () => void;
}

const initialGameState = {
  gameCode: "",
  locations: [],
  numberAssassins: 0,
  numberTasks: 0,
  timeBetweenTasks: 0,
  townhallTime: 0,
};

const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,

      setGameState: (updates) => set((state) => ({ ...state, ...updates })),
      resetGameState: () => set(() => ({ ...initialGameState })),
    }),
    {
      name: "game-storage"
    }
  )
);

export default useGameStore;

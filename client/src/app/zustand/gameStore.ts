import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {Player} from "../types.ts";

interface GameStore {
  gameCode: string;
  players: Player[];
  locations: string[];
  numberAssassins: number;
  ejectionConfirmation: boolean;
  numberTasks: number;
  timeBetweenTasks: number;
  townhallTime: number;
  screen: string;

  setGameState: (updates: Partial<GameStore>) => void;
  resetGameState: () => void;
}

const initialGameState = {
  gameCode: "",
  players: [],
  locations: [],
  numberAssassins: 0,
  ejectionConfirmation: false,
  numberTasks: 0,
  timeBetweenTasks: 0,
  townhallTime: 0,
  screen: ""
};

const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,

      setGameState: (updates) => set((state) => ({ ...state, ...updates })),
      resetGameState: () => set(() => ({ ...initialGameState })),
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

export default useGameStore;

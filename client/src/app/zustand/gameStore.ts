import { create } from "zustand";
import { Player } from "../types";

interface GameStore {
  gameCode: string
  status: string
  players: Player[]
  locations: string[]
  numberAssassins: number
  numberTasks: number
  timeBetweenTasks: number
  townhallTime: number
  tasksRemaining: number

  setGameState: (updates: Partial<GameStore>) => void;
  resetGameState: () => void;
}

const initialGameState = {
  gameCode: "",
  status: "waiting",
  players: [],
  locations: [],
  numberAssassins: 0,
  numberTasks: 0,
  timeBetweenTasks: 0,
  townhallTime: 0,
  tasksRemaining: 0,
};

const useGameStore = create<GameStore>((set) => ({
  ...initialGameState,

  setGameState: (updates) => set(updates),
  resetGameState: () => set(() => ({ ...initialGameState })),
}));

export default useGameStore;
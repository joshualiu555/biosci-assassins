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
}

const useGameStore = create<GameStore>((set) => ({
  gameCode: "",
  status: "waiting",
  players: [],
  locations: [],
  numberAssassins: 0,
  numberTasks: 0,
  timeBetweenTasks: 0,
  townhallTime: 0,
  tasksRemaining: 0,

  setGameState: (updates) => set(updates),
}));

export default useGameStore;

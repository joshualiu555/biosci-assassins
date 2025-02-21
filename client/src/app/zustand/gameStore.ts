import { create } from "zustand";

interface GameStore {
  gameCode: string;

  setGameCode: (gameCode: string) => void;
}

const useGameStore = create<GameStore>((set) => ({
  gameCode: "",

  setGameCode: (gameCode: string) => set({ gameCode }),
}));

export default useGameStore;

import { create } from "zustand";
import {persist} from "zustand/middleware";

interface GameStore {
  gameCode: string;

  setGameCode: (gameCode: string) => void;
}

const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameCode: "",
      setGameCode: (gameCode: string) => set({ gameCode }),
    }),
    {
      name: "game-code-storage",
    }
  )
);

export default useGameStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerStore {
  playerName: string;

  setPlayerName: (playerName: string) => void;
}

const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      playerName: "",
      setPlayerName: (playerName: string) => set({ playerName }),
    }),
    {
      name: "player-name-storage",
    }
  )
);

export default usePlayerStore;

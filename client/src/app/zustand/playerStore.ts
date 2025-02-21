import { create } from "zustand";

interface PlayerStore {
  playerName: string;

  setPlayerName: (playerName: string) => void;
}

const usePlayerStore = create<PlayerStore>((set) => ({
  playerName: "",

  setPlayerName: (playerName: string) => set({ playerName }),
}));

export default usePlayerStore;

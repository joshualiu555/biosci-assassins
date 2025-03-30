import { create } from "zustand";

interface PlayerStore {
  playerID: string
  name: string

  setPlayerState: (updates: Partial<PlayerStore>) => void;
  resetPlayerState: () => void;
}

const initialPlayerState = {
  playerID: "",
  name: ""
};

const usePlayerStore = create<PlayerStore>((set) => ({
  ...initialPlayerState,

  setPlayerState: (updates) => set(updates),
  resetPlayerState: () => set(initialPlayerState),
}));

export default usePlayerStore;
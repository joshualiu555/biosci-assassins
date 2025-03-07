import { create } from "zustand";

interface PlayerStore {
  playerID: string
  name: string
  position: string
  role: string
  status: string

  setPlayerState: (updates: Partial<PlayerStore>) => void;
  resetPlayerState: () => void;
}

const initialPlayerState = {
  playerID: "",
  name: "",
  position: "",
  role: "unassigned",
  status: "alive",
};

const usePlayerStore = create<PlayerStore>((set) => ({
  ...initialPlayerState,

  setPlayerState: (updates) => set(updates),
  resetPlayerState: () => set(initialPlayerState),
}));

export default usePlayerStore;
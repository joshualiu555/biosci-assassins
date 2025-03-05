import { create } from "zustand";

interface PlayerStore {
  playerID: string
  name: string
  position: string
  role: string
  status: string

  setPlayerState: (updates: Partial<PlayerStore>) => void;
}

const usePlayerStore = create<PlayerStore>((set) => ({
  playerID: "",
  name: "",
  position: "",
  role: "unassigned",
  status: "alive",

  setPlayerState: (updates) => set(updates),
}));

export default usePlayerStore;

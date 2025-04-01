import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerStore {
  playerID: string;
  name: string;
  setPlayerState: (updates: Partial<PlayerStore>) => void;
  resetPlayerState: () => void;
}

const initialPlayerState = {
  playerID: "",
  name: "",
};

const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      ...initialPlayerState,

      setPlayerState: (updates) => set((state) => ({ ...state, ...updates })),
      resetPlayerState: () => set(() => ({ ...initialPlayerState })),
    }),
    {
      name: "player-storage"
    }
  )
);

export default usePlayerStore;

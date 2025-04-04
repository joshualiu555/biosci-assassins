import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PlayerStore {
  playerID: string;
  name: string;
  role: string;

  setPlayerState: (updates: Partial<PlayerStore>) => void;
  resetPlayerState: () => void;
}

const initialPlayerState = {
  playerID: "",
  name: "",
  role: ""
};

const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      ...initialPlayerState,

      setPlayerState: (updates) => set((state) => ({ ...state, ...updates })),
      resetPlayerState: () => set(() => ({ ...initialPlayerState })),
    }),
    {
      name: "player-storage",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

export default usePlayerStore;

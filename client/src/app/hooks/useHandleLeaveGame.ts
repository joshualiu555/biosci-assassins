import useGameStore from "../zustand/gameStore";
import usePlayerStore from "../zustand/playerStore.ts";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import socket from "../socket-io.ts";

const useHandleLeaveGame = () => {
  const { resetGameState } = useGameStore();
  const { resetPlayerState } = usePlayerStore();
  const navigate = useNavigate();

  return async () => {
    const response = await axios.delete("http://localhost:3000/players/removePlayer", {
      withCredentials: true,
    });

    socket.emit("removePlayer");

    if (response.data.switchAdmin === true) {
      socket.emit("switchAdmin", response.data.updatedPlayers);
    }

    resetGameState();
    resetPlayerState();
    sessionStorage.removeItem("screen");
    sessionStorage.removeItem("game-storage");
    sessionStorage.removeItem("player-storage");

    navigate("/");
  };
};

export default useHandleLeaveGame;

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
    const response = await axios.delete("https://biosci-assassins-f380214977c5.herokuapp.com/players/removePlayer", {
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

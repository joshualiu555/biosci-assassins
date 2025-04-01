import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import {Player} from "../types.ts";

const Game = () => {
  const { resetGameState, gameCode, numberTasks } = useGameStore();
  const { resetPlayerState, playerID } = usePlayerStore();

  const [screen, setScreen] = useState("playing");
  const [players, setPlayers] = useState<Player[]>([]);
  const [tasksRemaining, setTasksRemaining] = useState(numberTasks);
  const [status, setStatus] = useState("alive");

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("http://localhost:3000/games/getGame", {
        withCredentials: true
      });
      setPlayers(response.data.game.players);
      setScreen(response.data.game.status);
      setTasksRemaining(response.data.game.tasksRemaining);
    };
    fetchGame()
      .then(() => {
        console.log("Game fetched");
      })
      .catch(() => {
        console.error("Failed to fetch game");
      });

    const fetchPlayer = async () => {
      const response = await axios.get("http://localhost:3000/players/getPlayer", {
        withCredentials: true
      });
      setStatus(response.data.player.status);
    }
    fetchPlayer()
      .then(() => {
        console.log("Player fetched");
      })
      .catch(() => {
        console.error("Failed to fetch player");
      });

    window.addEventListener("popstate", handleBackButton);

    return () => {
      setTimeout(() => {
        window.removeEventListener("popstate", handleBackButton);
      }, 0);
    };
  }, [])

  const handleBackButton = async () => {
    await axios.delete("http://localhost:3000/players/removePlayer", {
      withCredentials: true,
    });

    socket.emit("removePlayer");

    resetGameState();
    resetPlayerState();
  };

  const handleMarkDead = async () => {
    await axios.put("http://localhost:3000/players/markDead",
      {
        gameCode: gameCode,
        playerID: playerID
      },
      {
        withCredentials: true
      }
    );
    setStatus("dead");
  }

  const handleCallTownhall = async () => {
    await axios.put("http://localhost:3000/games/changeStatus", {
      gameCode: gameCode,
      status: "townhall"
    });
    setScreen("townhall");
    // stop the tasks
  }

  return (
    <div>
      <button onClick={handleMarkDead}>Mark yourself dead</button>
      <button onClick={handleCallTownhall}>Call townhall</button>
      <p>Click the back button to leave the game</p>
      <p>{status}</p>
      <p>{screen}</p>
    </div>
  );
};

export default Game;

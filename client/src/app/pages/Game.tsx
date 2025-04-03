import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import { useSessionStorage } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import {Player} from "../types.ts";


const Game = () => {
  const { resetGameState, gameCode, numberTasks } = useGameStore();
  const { resetPlayerState, playerID } = usePlayerStore();

  const [screen, setScreen] = useSessionStorage("screen", "playing");
  const [players, setPlayers] = useState<Player[]>([]);
  const [tasksRemaining, setTasksRemaining] = useState(numberTasks);
  const [status, setStatus] = useState("alive");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("http://localhost:3000/games/getGame", {
        withCredentials: true
      });
      setPlayers(response.data.game.players);
      setScreen(response.data.game.status);
      setTasksRemaining(response.data.game.numberTasks);
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

    socket.on("endedGame", async data => {
      await axios.delete("http://localhost:3000/players/removeRedisAndCookie", {
        withCredentials: true
      });
      resetGameState();
      resetPlayerState();
      sessionStorage.removeItem("screen");
      sessionStorage.removeItem("game-storage");
      sessionStorage.removeItem("player-storage");
      navigate('/finished', { state: { data: data } });
    })

    return () => {
      socket.off("endedGame");
    };
  }, [])

  const handleBackButton = async () => {
    await axios.delete("http://localhost:3000/players/removePlayer", {
      withCredentials: true,
    });

    socket.emit("removePlayer");

    resetGameState();
    resetPlayerState();
    sessionStorage.removeItem("screen");
    sessionStorage.removeItem("game-storage");
    sessionStorage.removeItem("player-storage");

    navigate("/");
  };

  const handleMarkDead = async () => {
    const response = await axios.put("http://localhost:3000/players/markDead",
      {
        gameCode: gameCode,
        playerID: playerID
      },
      {
        withCredentials: true
      }
    );
    setStatus("dead");
    if (response.data.result !== "Continue") {
      socket.emit("endGame", {
        result: response.data.result,
        players: response.data.players
      });
    }
  }

  const handleCallTownhall = async () => {
    await axios.put("http://localhost:3000/games/changeStatus", {
      gameCode: gameCode,
      status: "townhall"
    });
    setScreen("townhall");
  }

  return (
    <div>
      {status === "alive" ? <button onClick={handleBackButton}>Leave game</button> : null}
      <button onClick={handleMarkDead}>Mark yourself dead</button>
      <button onClick={handleCallTownhall}>Call townhall</button>
      <p>Click the back button to leave the game</p>
      <p>{status}</p>
      <p>{screen}</p>
    </div>
  );
};

export default Game;

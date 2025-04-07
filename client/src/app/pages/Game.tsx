import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import { useNavigate } from "react-router-dom";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import Task from "../components/Task.tsx"
import Townhall from "../components/Townhall.tsx";

const Game = () => {
  const { setGameState, resetGameState, gameCode, players, numberTasks, screen } = useGameStore();
  const { resetPlayerState, playerID, role } = usePlayerStore();

  const [doingTask, setDoingTask] = useState(false);
  const [tasksRemaining, setTasksRemaining] = useState(numberTasks);
  const [status, setStatus] = useState("alive");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("http://localhost:3000/games/getGame", {
        withCredentials: true
      });
      setTasksRemaining(response.data.game.numberTasks);
      setGameState({
        players: response.data.game.players,
        screen: response.data.game.status
      });
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

    socket.on("completedTask", remaining => {
      setTasksRemaining(remaining);
    })

    socket.on("removedPlayer", playerID => {
      setGameState({ players: players.filter((player) => player.playerID !== playerID) });
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
      socket.off("removedPlayer");
      socket.off("endedGame");
    };
  }, [])

  const handleLeaveGame = async () => {
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
    setGameState({ screen: "townhall" });
  }

  const handleCompleteTask = async () => {
    const response = await axios.put("http://localhost:3000/games/completeTask",
      {
        gameCode: gameCode,
        role: role
      },
      {
        withCredentials: true
      }
    );
    if (response.data.result === "Crewmates win") {
      socket.emit("endGame", {
        result: response.data.result,
        players: response.data.players
      });
    }
    if (role === "crewmate") socket.emit("completeTask", tasksRemaining - 1);
    setDoingTask(false);
  }

  return (
    <div>
      {status === "alive" && <button onClick={handleMarkDead}>Mark yourself dead</button>}
      <button onClick={handleLeaveGame}>Leave game</button>
      <button onClick={handleCallTownhall}>Call townhall</button>
      <p>{tasksRemaining}</p>

      {!doingTask && screen != "townhall" && (
        <button onClick={() => {setDoingTask(true)}}>
          Start task
        </button>
      )}
      {doingTask && screen != "townhall" && (
        <div>
          <button onClick={handleCompleteTask}>Complete task</button>
          <Task />
        </div>
      )}

      {screen === "townhall" && (
        <Townhall />
      )}

      <p>Click the back button to leave the game</p>
      <p>{status}</p>
      <p>{screen}</p>
    </div>
  );
};

export default Game;

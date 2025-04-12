import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import { useNavigate } from "react-router-dom";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import useHandleLeaveGame from "../hooks/useHandleLeaveGame.ts"
import Task from "../components/Task.tsx"
import Townhall from "../components/Townhall.tsx";

const Game = () => {
  const { setGameState, resetGameState, gameCode, players, numberTasks, screen } = useGameStore();
  const { setPlayerState, resetPlayerState, playerID, position, role, status } = usePlayerStore();

  const [doingTask, setDoingTask] = useState(false);
  const [tasksRemaining, setTasksRemaining] = useState(numberTasks);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("https://biosci-assassins-f380214977c5.herokuapp.com/games/getGame", {
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
      const response = await axios.get("https://biosci-assassins-f380214977c5.herokuapp.com/players/getPlayer", {
        withCredentials: true
      });
      setPlayerState({
        position: response.data.player.position,
        status: response.data.player.status
      });
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

    socket.on("startedTownhall", () => {
      setGameState({ screen: "voting" });
    })

    socket.on("removedPlayer", playerID => {
      setGameState({ players: players.filter((player) => player.playerID !== playerID) });
    });

    socket.on("switchedAdmin", (updatedPlayers) => {
      setGameState({ players: updatedPlayers });
      for (const player of updatedPlayers) {
        if (position === "admin" && player.playerID === usePlayerStore.getState().playerID) {
          setPlayerState({ position: "admin" });
          break;
        }
      }
    });

    socket.on("endedGame", async data => {
      await axios.delete("https://biosci-assassins-f380214977c5.herokuapp.com/players/removeRedisAndCookie", {
        withCredentials: true
      });
      resetGameState();
      resetPlayerState();
      sessionStorage.removeItem("screen");
      sessionStorage.removeItem("game-storage");
      sessionStorage.removeItem("player-storage");
      sessionStorage.removeItem("vote-out");
      sessionStorage.removeItem("is-assassin");
      navigate('/finished', { state: { data: data } });
    })

    return () => {
      socket.off("completedTask");
      socket.off("startedTownhall");
      socket.off("removedPlayer");
      socket.off("switchedAdmin");
      socket.off("endedGame");
    };
  }, [])

  const handleLeaveGame = useHandleLeaveGame();

  const handleMarkDead = async () => {
    const response = await axios.put("https://biosci-assassins-f380214977c5.herokuapp.com/players/markDead",
      {
        gameCode: gameCode,
        playerID: playerID
      },
      {
        withCredentials: true
      }
    );
    setPlayerState({ status: "dead" });
    if (response.data.result !== "Continue") {
      socket.emit("endGame", {
        result: response.data.result,
        players: response.data.players
      });
    }
  }

  const handleCallTownhall = async () => {
    await axios.put("https://biosci-assassins-f380214977c5.herokuapp.com/games/changeStatus", {
      gameCode: gameCode,
      status: "voting"
    });

    socket.emit("startTownhall");
  }

  const handleCompleteTask = async () => {
    const response = await axios.put("https://biosci-assassins-f380214977c5.herokuapp.com/games/completeTask",
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
      <button onClick={handleLeaveGame}>Leave game</button>
      <br/>
      {status === "alive" && <button onClick={handleMarkDead}>Mark yourself dead</button>}
      <br/>
      {status === "alive" && screen != "voting" && screen != "result" && <button onClick={handleCallTownhall}>Call townhall</button>}
      <br/>

      <h3>Tasks Remaining: {tasksRemaining}</h3>
      <h3>{status}</h3>

      {!doingTask && screen != "voting" && screen != "result" && (
        <button onClick={() => {setDoingTask(true)}}>
          Start task
        </button>
      )}
      {doingTask && screen != "voting" && screen != "result" && (
        <div>
          <button onClick={handleCompleteTask}>Complete task</button>
          <Task />
        </div>
      )}

      {(screen === "voting" || screen === "result") && (
        <Townhall />
      )}
    </div>
  );
};

export default Game;

import { useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";

const Lobby = () => {
  const { setGameState, gameCode, players, locations, numberAssassins, numberTasks, timeBetweenTasks, townhallTime } = useGameStore();
  const { setPlayerState, position } = usePlayerStore();

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("http://localhost:3000/games/getGame", {
        withCredentials: true
      });
      setGameState(response.data);
    };

    fetchGame()
      .then(() => {
        console.log("Game fetched");
      })
      .catch(() => {
        console.error("Failed to fetch game");
      });

    socket.on("addedPlayer", (player) => {
      setGameState({ players: [...useGameStore.getState().players, player] });
    });

    socket.on("removedPlayer", (player) => {
      setGameState({ players: useGameStore.getState().players.filter(searchPlayer => searchPlayer.playerID !== player.playerID) });
    });

    window.addEventListener("popstate", handleBackButton);

    return () => {
      socket.off("addedPlayer");
      socket.off("removedPlayer");
      setTimeout(() => {
        window.removeEventListener("popstate", handleBackButton);
      }, 0);
    };
  }, []);

  const handleBackButton = async () => {
    socket.emit("removePlayer");

    await axios.delete("http://localhost:3000/players/removePlayer", {
      params: {
        gameCode: useGameStore.getState().gameCode,
      },
      withCredentials: true,
    });
  };

  const handleStartGame = () => {

  }

  return (
    <div>
      <div>
        <p>Game code: {gameCode}</p>
        <p>Number assassins: {numberAssassins}</p>
        <p>Number tasks: {numberTasks}</p>
        <p>Time between tasks: {timeBetweenTasks} minutes</p>
        <p>Townhall time: {townhallTime} minutes</p>
        <h3>Locations:</h3>
        {locations.length > 0 ?
          locations.map((location, index) => <p key={index}>{location}</p>)
          :
          <p>No locations yet...</p>
        }
      </div>
      <div>
        <h3>Players:</h3>
        {players.length > 0 ?
          players.map(player => <p key={player.playerID}>{player.name}</p>)
          :
          <p>No players yet...</p>
        }
      </div>
      <div>
        {position === "admin" ? (
          <button onClick={handleStartGame}>
            Start Game
          </button>
          ) : (
          <p>Waiting for admin to start game</p>
          )
        }
      </div>
    </div>
  );
};

export default Lobby;

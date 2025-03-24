import { useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";

const Lobby = () => {
  const { setGameState, resetGameState, gameCode, players, locations, numberAssassins, numberTasks, timeBetweenTasks, townhallTime } = useGameStore();
  const { setPlayerState, resetPlayerState, playerID, position } = usePlayerStore();

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("http://localhost:3000/games/getGame", {
        withCredentials: true
      });
      setGameState(response.data);
      socket.emit("reconnect", response.data.gameCode);
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
      setPlayerState(response.data);
    }
    fetchPlayer()
      .then(() => {
        console.log("Player fetched");
      })
      .catch(() => {
        console.error("Failed to fetch player");
      });

    socket.on("addedPlayer", (player) => {
      setGameState({ players: [...useGameStore.getState().players, player] });
    });

    socket.on("removedPlayer", (player) => {
      setGameState({ players: useGameStore.getState().players.filter(searchPlayer => searchPlayer.playerID !== player.playerID) });
    });

    socket.on("switchedAdmin", (updatedPlayers) => {
      setGameState({ players: updatedPlayers });
      for (const player of updatedPlayers) {
        if (player.position === "admin" && player.playerID === playerID) {
          setPlayerState({ position: "admin" })
          break;
        }
      }
    });

    socket.on("startedGame", () => {
      // show roles for 15 seconds to allow assassins to see each other
      navigate("/game");
    })

    window.addEventListener("popstate", handleBackButton);

    return () => {
      socket.off("addedPlayer");
      socket.off("removedPlayer");
      socket.off("switchedAdmin");
      socket.off("startedGame");
      setTimeout(() => {
        window.removeEventListener("popstate", handleBackButton);
      }, 0);
    };
  }, []);

  const handleBackButton = async () => {
    const response = await axios.delete("http://localhost:3000/players/removePlayer", {
      params: {
        gameCode: useGameStore.getState().gameCode,
      },
      withCredentials: true,
    });

    socket.emit("removePlayer");

    if (response.data.switchAdmin === true) {
      socket.emit("switchAdmin", response.data.updatedPlayers);
    }

    resetGameState();
    resetPlayerState();
  };

  const handleStartGame = async () => {
    // TODO - Uncomment in production
    // if (players.length < 2 * numberAssassins + 1) {
    //   alert(`Must have at least ${2 * numberAssassins + 1} players`);
    //   return;
    // }

    // send axios post / put request to assign roles
    await axios.put("http://localhost:3000/game/assignRoles", {
      withCredentials: true
    })
    socket.emit("startGame");
  }

  return (
    <div>
      <div>
        <h2>Click the back button to leave the game</h2>
      </div>
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

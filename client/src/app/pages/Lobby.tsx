import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import { Player } from "../types.ts";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("");

  const { setGameState, resetGameState, gameCode, locations, numberAssassins, numberTasks, timeBetweenTasks, townhallTime } = useGameStore();
  const { setPlayerState, resetPlayerState, playerID, name} = usePlayerStore();

  const [screen, setScreen] = useState("lobby");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("http://localhost:3000/games/getGame", {
        withCredentials: true
      });
      setGameState({
        gameCode: response.data.game.gameCode,
        locations: response.data.game.locations,
        numberAssassins: response.data.game.numberAssassins,
        numberTasks: response.data.game.numberTasks,
        timeBetweenTasks: response.data.game.timeBetweenTasks,
        townhallTime: response.data.game.townhallTime,
      });
      setPlayers(response.data.game.players);
      socket.emit("reconnect", response.data.game.gameCode);
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
      setPlayerState({
        playerID: response.data.player.playerID,
        name: response.data.player.name
      });
      setPosition(response.data.player.position);
    }
    fetchPlayer()
      .then(() => {
        console.log("Player fetched");
      })
      .catch(() => {
        console.error("Failed to fetch player");
      });

    socket.on("addedPlayer", (player) => {
      setPlayers((prevPlayers) => [...prevPlayers, player]);
    });

    socket.on("removedPlayer", (playerID) => {
      setPlayers(prevPlayers => prevPlayers.filter(searchPlayer => searchPlayer.playerID !== playerID));
    });

    socket.on("switchedAdmin", (updatedPlayers) => {
      setPlayers(updatedPlayers);
      for (const player of updatedPlayers) {
        if (player.position === "admin" && player.playerID === usePlayerStore.getState().playerID) {
          setPosition("admin")
          break;
        }
      }
    });

    socket.on("assignedRoles", updatedPlayers => {
      setPlayers(updatedPlayers);
      const player = updatedPlayers.find((searchPlayer: { playerID: string; }) => searchPlayer.playerID === usePlayerStore.getState().playerID);
      setRole(player.role);
      setScreen("roles");
    })

    socket.on("startedGame", () => {
      navigate("/game");
    })

    window.addEventListener("popstate", handleBackButton);

    return () => {
      socket.off("addedPlayer");
      socket.off("removedPlayer");
      socket.off("switchedAdmin");
      socket.off("assignedRoles");
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

  const handleAssignRoles = async () => {
    // TODO - Uncomment in production
    // if (players.length < 2 * numberAssassins + 1) {
    //   alert(`Must have at least ${2 * numberAssassins + 1} players`);
    //   return;
    // }

    const response = await axios.put("http://localhost:3000/games/assignRoles",
      {
        numberAssassins: numberAssassins,
      },
      {
        withCredentials: true
      }
    );
    setPlayers(response.data.players);

    socket.emit("assignRoles", response.data.players);
  }

  const handleStartGame = async () => {
    // set game state to "playing" on backend with axios.put
  }

  return (
    <div>
      {screen === "lobby" ? (
        <div>
          <div>
            <h2>Click the back button to leave the game</h2>
          </div>
          <div>
            <p>Game code: {gameCode}</p>
            <p>You: {name}</p>
            <p>Number assassins: {numberAssassins}</p>
            <p>Number tasks: {numberTasks}</p>
            <p>Time between tasks: {timeBetweenTasks} minutes</p>
            <p>Townhall time: {townhallTime} minutes</p>
            <h3>Locations:</h3>
            {locations.length > 0 ? (
              locations.map((location, index) => <p key={index}>{location}</p>)
            ) : (
              <p>No locations yet...</p>
            )}
          </div>
          <div>
            <h3>Players:</h3>
            {players.length > 0 ? (
              players.map(player => <p key={player.playerID}>{player.name}</p>)
            ) : (
              <p>No players yet...</p>
            )}
          </div>
          <div>
            {position === "admin" ? (
              <button onClick={handleAssignRoles}>Assign Roles</button>
            ) : (
              <p>Waiting for admin to assign roles</p>
            )}
          </div>
        </div>
      ) :
        <div>
          <h2>{role}</h2>
          <div>
            {position === "admin" ? (
              <button onClick={handleStartGame}>Start game</button>
            ) : (
              <p>Waiting for admin to start game</p>
            )}
          </div>
        </div>
      }
    </div>
  )
};

export default Lobby;

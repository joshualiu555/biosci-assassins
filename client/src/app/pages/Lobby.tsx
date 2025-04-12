import { useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import { useNavigate } from "react-router-dom";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import useHandleLeaveGame from "../hooks/useHandleLeaveGame.ts"

const Lobby = () => {
  const { setGameState, gameCode, players, locations, numberAssassins, ejectionConfirmation, numberTasks, screen } = useGameStore();
  const { setPlayerState, name, position, role} = usePlayerStore();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGame = async () => {
      const response = await axios.get("https://biosci-assassins-f380214977c5.herokuapp.com/games/getGame", {
        withCredentials: true
      });
      setGameState({
        gameCode: response.data.game.gameCode,
        players: response.data.game.players,
        locations: response.data.game.locations,
        numberAssassins: response.data.game.numberAssassins,
        ejectionConfirmation: response.data.game.ejectionConfirmation,
        numberTasks: response.data.game.numberTasks,
        timeBetweenTasks: response.data.game.timeBetweenTasks,
        townhallTime: response.data.game.townhallTime,
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
        playerID: response.data.player.playerID,
        name: response.data.player.name,
        role: response.data.player.role
      });
      setPlayerState({ position: response.data.player.position });
      // reconnects on refresh; socket.io takes care of the same socket joining the same room twice
      socket.emit("reconnect", {
        gameCode: useGameStore.getState().gameCode,
        playerID: response.data.player.playerID
      });
    }
    fetchPlayer()
      .then(() => {
        console.log("Player fetched");
      })
      .catch(() => {
        console.error("Failed to fetch player");
      });

    socket.on("addedPlayer", (player) => {
      console.log("Added player");
      setGameState({ players: [...useGameStore.getState().players, player] });
    });

    socket.on("removedPlayer", playerID => {
      setGameState({ players: useGameStore.getState().players.filter((player) => player.playerID !== playerID) });
    });

    socket.on("switchedAdmin", (updatedPlayers) => {
      setGameState({ players: updatedPlayers });
      for (const player of updatedPlayers) {
        if (player.position === "admin" && player.playerID === usePlayerStore.getState().playerID) {
          setPlayerState({ position: "admin" });
          break;
        }
      }
    });

    socket.on("assignedRoles", updatedPlayers => {
      setGameState({ players: updatedPlayers });
      const player = updatedPlayers.find((searchPlayer: { playerID: string; }) => searchPlayer.playerID === usePlayerStore.getState().playerID);
      setPlayerState({
        role: player.role
      });
      setGameState({ screen: "roles" });
    })

    socket.on("startedGame", () => {
      navigate("/game");
    })

    return () => {
      socket.off("addedPlayer");
      socket.off("removedPlayer");
      socket.off("switchedAdmin");
      socket.off("assignedRoles");
      socket.off("startedGame");
    };
  }, []);

  const handleLeaveGame = useHandleLeaveGame();

  const handleAssignRoles = async () => {
    if (players.length < 2 * numberAssassins + 1) {
      alert(`Must have at least ${2 * numberAssassins + 1} players`);
      return;
    }

    await axios.put("https://biosci-assassins-f380214977c5.herokuapp.com/games/changeStatus", {
      gameCode: gameCode,
      status: "roles"
    })

    const response = await axios.put("https://biosci-assassins-f380214977c5.herokuapp.com/games/assignRoles",
      {
        gameCode: gameCode,
        numberAssassins: numberAssassins,
      },
      {
        withCredentials: true
      }
    );
    setGameState({ players: response.data.players });

    socket.emit("assignRoles", response.data.players);
  }

  const handleStartGame = async () => {
    await axios.put("https://biosci-assassins-f380214977c5.herokuapp.com/games/changeStatus", {
      gameCode: gameCode,
      status: "playing"
    })
    socket.emit("startGame");
  }

  return (
    <div>
      {screen === "lobby" ? (
        <div>
          <button onClick={handleLeaveGame}>Leave game</button>
          <div>
            <h3>Game code: {gameCode}</h3>
            <h3>You: {name}</h3>
            <h3>Number assassins: {numberAssassins}</h3>
            <h3>Ejection Confirmation: {ejectionConfirmation ? "On" : "Off"}</h3>
            <h3>Number tasks: {numberTasks}</h3>
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
              <h2>Waiting for admin to assign roles...</h2>
            )}
          </div>
        </div>
      ) :
        <div>
          <h1>{role}</h1>
          <div>
            {position === "admin" ? (
              <button onClick={handleStartGame}>Start game</button>
            ) : (
              <h2>Waiting for admin to start game</h2>
            )}
          </div>
        </div>
      }
    </div>
  )
};

export default Lobby;

import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import { Player, Game } from "../types.ts";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";

const Lobby = () => {
  const [game, setGame] = useState<Game>();
  const [player, setPlayer] = useState<Player>();
  const [players, setPlayers] = useState<Player[]>([]);

  const { setGameState, gameCode, locations, numberAssassins, numberTasks, timeBetweenTasks, townhallTime } = useGameStore();
  const { setPlayerState } = usePlayerStore();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get("http://localhost:3000/games/getGame", {
          withCredentials: true
        });
        setGameState(response.data);
        setGame(response.data);
      } catch (error) {
        console.error("Failed to fetch game: ", error);
      }
    };

    fetchGame()
      .then(() => {
        console.log("Game fetched");
      })
      .catch(() => {
        console.error("Failed to fetch game");
      });
  }, []);

  useEffect(() => {
    if (!game) return;

    const fetchPlayers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/players/getPlayers", {
          params: {
            gameCode: gameCode
          },
          withCredentials: true
        });
        setPlayer(response.data.player);
        setPlayerState(response.data.player);
        setPlayers(response.data.players);
      } catch (error) {
        console.error("Failed to fetch players: ", error);
      }
    };

    fetchPlayers()
      .then(() => {
        console.log("Players fetched");
      })
      .catch(() => {
        console.error("Failed to fetch players");
      });
  }, [game]);

  useEffect(() => {
    socket.on("addedPlayer", (player) => {
      setPlayers((prevPlayers) => [...prevPlayers, player]);
    });

    socket.on("removedPlayer", (player) => {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((searchPlayer) => searchPlayer.playerID !== player.playerID)
      );
    });

    return () => {
      socket.off("addedPlayer");
      socket.off("removedPlayer");
    };
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", handleBackButton);
    return () => {
      setTimeout(() => {
        window.removeEventListener("popstate", handleBackButton);
      }, 0);
    };
  }, [game]);

  const handleBackButton = async () => {
    if (!game) return;

    socket.emit("removePlayer");

    await axios.delete("http://localhost:3000/players/removePlayer", {
      params: {
        gameCode: gameCode
      },
      withCredentials: true,
    });
  };

  const handleStartGame = () => {

  }

  return (
    <div>
      {game ?
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
        :
        <p>Game has not loaded yet...</p>
      }
      <div>
        <h3>Players:</h3>
        {players.length > 0 ?
          players.map(player => <p key={player.playerID}>{player.name}</p>)
          :
          <p>No players yet...</p>
        }
      </div>
      <div>
        {player ? (
          player.position === "admin" ? (
            <button onClick={handleStartGame}>
              Start Game
            </button>
          ) : (
            <p>Waiting for admin to start game</p>
          )
        ) : (
          <p>No player yet</p>
        )}

      </div>
    </div>
  );
};

export default Lobby;

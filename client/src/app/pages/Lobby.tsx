import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import {Player} from "../types.ts";

const Lobby = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  const { gameCode } = useGameStore();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/games/getPlayers", {
          params: {
            gameCode: gameCode
          }
        });
        setPlayers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPlayers()
      .then(() => {
        console.log("Players fetched");
      })
      .catch(() => {
        console.log("Failed to fetch players");
      })

    socket.on("addedPlayer", (player) => {
      setPlayers(prevPlayers => [...prevPlayers, player]);
    });

    window.addEventListener("popstate", handleBackButton, true);

    return () => {
      socket.off("addedPlayer");
      window.removeEventListener("popstate", handleBackButton, true);
    };
  }, []);

  const handleBackButton = async () => {
    await axios.delete("http://localhost:3000/players/removePlayer", {
      params: {
        gameCode: gameCode
      },
      withCredentials: true
    })
  };

  return (
    <div>
      <p>{gameCode}</p>
      <div>
        {players.length > 0 ? (
          players.map((player) => <p key={player.playerID}>{player.name}</p>)
        ) : (
          <p>No players yet...</p>
        )}
      </div>
    </div>
  );
};

export default Lobby;

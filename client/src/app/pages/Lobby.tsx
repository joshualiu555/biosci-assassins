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
        const response = await axios.get(`http://localhost:3000/games/getPlayers?gameCode=${gameCode}`);
        setPlayers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPlayers();

    socket.on("addedPlayer", (player) => {
      setPlayers(prevPlayers => [...prevPlayers, player]);
    });

    return () => {
      socket.off("addedPlayer");
    };
  }, [gameCode]);

  return (
    <div>
      <p>{gameCode}</p>
      <div>
        {players.length > 0 ? (
          players.map((player) => <p key={player.id}>{player.name}</p>)
        ) : (
          <p>No players yet...</p>
        )}
      </div>
    </div>
  );
};

export default Lobby;

import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";

const Lobby = () => {
  const [players, setPlayers] = useState([]);

  const { gameCode } = useGameStore();

  useEffect(() => {
    socket.on("addedPlayer", (player) => {
      // TODO - Add to zustand
      setPlayers(prevPlayers => [...prevPlayers, player]);
    });

    return () => {
      socket.off("addedPlayer");
    };
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/games/getPlayers?gameCode=${gameCode}`);
        setPlayers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // TODO - Add to zustand
    fetchPlayers();
    // add gameCode to dependency array?
  }, []);

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

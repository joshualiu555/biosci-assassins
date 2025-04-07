import { useState } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import { Player } from "../types.ts";

const Townhall = () => {
  const [voted, setVoted] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>();

  const { setGameState, gameCode, players} = useGameStore();

  const handleCastVote = async () => {
    if (!selectedPlayer) return;

    const response = await axios.post("http://localhost:3000/games/castVote",
      {
        gameCode: gameCode,
        playerID: selectedPlayer.playerID
      },
      {
        withCredentials: true
      }
    )

    setVoted(true);
  }

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
  };

  return (
    <div>
      {players
        .filter((player) => player.status === "alive")
        .map((player) => (
          <button
            key={player.playerID}
            onClick={() => handleSelectPlayer(player)}
            style={{
              color: selectedPlayer?.playerID === player.playerID ? "red" : "black",
            }}
          >
            {player.name}
          </button>
        ))}

      {!voted && <button onClick={handleCastVote}>Cast Vote</button>}
    </div>
  );
};

export default Townhall;

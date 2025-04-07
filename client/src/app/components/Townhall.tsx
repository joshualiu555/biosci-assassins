import axios from "axios";
import socket from "../socket-io.ts";
import { Player } from "../types.ts";

const Townhall = ({players}: { players: Player[] }) => {
  const handleCastVote = async () => {
    const response = await axios.post("http://localhost:3000/games/castVote",
      {
        gameCode: gameCode,
        player: player
      },
      {
        withCredentials: true
      }
    )
  }

  return (
    <div>
      {players
        .filter((player) => player.status === "alive")
        .map((player) => (
          <button key={player.playerID}>{player.name}</button>
        ))}

      <button onClick={handleCastVote}>Cast Vote</button>
    </div>
  );
};

export default Townhall;

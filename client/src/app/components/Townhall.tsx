import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import { Player } from "../types.ts";

const Townhall = () => {
  const [voted, setVoted] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player>();

  const { setGameState, gameCode, players, screen, ejectionConfirmation} = useGameStore();

  useEffect(() => {
    const fetchPlayer = async () => {
      const response = await axios.get("http://localhost:3000/players/getPlayer", {
        withCredentials: true
      });
      setStatus(response.data.player.status);
    }
    fetchPlayer()
      .then(() => {
        console.log("Player fetched");
      })
      .catch(() => {
        console.error("Failed to fetch player");
      });

    socket.on("allVoted", async ({ voteOut, isAssassin, players }) => {
      await axios.put("http://localhost:3000/games/changeStatus", {
        gameCode: gameCode,
        status: "result"
      });

      setGameState({ screen: "result" });
    })

    return () => {
      socket.off("allVoted");
    };
  }, [])

  const handleCastVote = async () => {
    if (!selectedPlayer) return;

    setVoted(true);

    const response = await axios.post("http://localhost:3000/players/castVote",
      { playerID: selectedPlayer.playerID },
      { withCredentials: true }
    )
    setGameState({ players: response.data.players });

    if (response.data.allVoted) {
      socket.emit("allVoted", {
        voteOut: response.data.voteOut,
        isAssassin: response.data.isAssassin,
        players: response.data.players
      });
    }
  }

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
  };

  return (
    screen === "voting" ? (
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

        {status === "alive" && !voted && (
          <button onClick={handleCastVote}>Cast Vote</button>
        )}
      </div>
    ) : (
      <div>

      </div>
    )
  );

};

export default Townhall;

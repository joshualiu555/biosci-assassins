import { useState, useEffect } from "react";
import { useSessionStorage } from "usehooks-ts";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import { Player } from "../types.ts";

const Townhall = () => {
  const [voted, setVoted] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player>();
  const [voteOut, setVoteOut] = useSessionStorage<Player | null>("vote-out", null);
  const [isAssassin, setIsAssassin] = useSessionStorage("is-assassin", null);

  const { setGameState, gameCode, players, screen, ejectionConfirmation} = useGameStore();
  const { position } = usePlayerStore();

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
      console.log("All Voted");
      setVoteOut(voteOut);
      setIsAssassin(isAssassin);
      setGameState({ players: players });

      await axios.put("http://localhost:3000/games/changeStatus", {
        gameCode: gameCode,
        status: "result"
      });

      if (voteOut != null) {
        const response = await axios.put("http://localhost:3000/players/markDead",
          {
            gameCode: gameCode,
            playerID: voteOut.playerID
          },
          {
            withCredentials: true
          }
        );
        if (response.data.result !== "Continue") {
          socket.emit("endGame", {
            result: response.data.result,
            players: response.data.players
          });
        }
      }

      console.log("Result");
      setGameState({ screen: "result" });
    })

    socket.on("resumedPlaying", () => {
      setGameState({ screen: "playing" });
    });

    return () => {
      socket.off("allVoted");
      socket.off("resumedPlaying");
    };
  }, [])

  const handleCastVote = async () => {
    if (!selectedPlayer) return;

    setVoted(true);

    const response = await axios.post("http://localhost:3000/players/castVote",
      { playerID: selectedPlayer.playerID },
      { withCredentials: true }
    )

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

  const handleResumeGame = async () => {
    setVoteOut(null);
    setIsAssassin(null);
    socket.emit("resumePlaying");
  }

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
        {voteOut ?
          <div>
            <p>{voteOut.name} was voted out</p>
            {ejectionConfirmation && (
              isAssassin ?
                <p>They were an assassin</p>
                :
                <p>They were not an assassin</p>
            )}
          </div>
          :
          <p>No one was voted out</p>
        }
        <div>
          {position === "admin" ? (
            <button onClick={handleResumeGame}>Resume game</button>
          ) : (
            <p>Waiting for admin to resume game</p>
          )}
        </div>
      </div>
    )
  );

};

export default Townhall;

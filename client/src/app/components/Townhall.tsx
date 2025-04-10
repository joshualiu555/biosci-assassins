import { useState, useEffect } from "react";
import { useSessionStorage } from "usehooks-ts";
import axios from "axios";
import socket from "../socket-io.ts";
import useGameStore from "../zustand/gameStore.ts";
import usePlayerStore from "../zustand/playerStore.ts";
import { Player } from "../types.ts";

const Townhall = () => {
  const [voted, setVoted] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>();
  const [voteOut, setVoteOut] = useSessionStorage<Player | null>("vote-out", null);
  const [isAssassin, setIsAssassin] = useSessionStorage("is-assassin", null);

  const { setGameState, gameCode, players, screen, ejectionConfirmation} = useGameStore();
  const { setPlayerState, playerID, position, status } = usePlayerStore();

  useEffect(() => {
    socket.on("markedDead", deadPlayerID => {
      if (deadPlayerID === playerID) {
        setPlayerState({ status: "dead" });
      }
    })

    socket.on("allVoted", async ({ voteOut, isAssassin, players }) => {
      setVoteOut(voteOut);
      setIsAssassin(isAssassin);
      setGameState({ players: players });

      await axios.put("http://localhost:3000/games/changeStatus", {
        gameCode: gameCode,
        status: "result"
      });

      setGameState({ screen: "result" });

      if (voteOut !== null) {
        const response = await axios.put("http://localhost:3000/players/markDead",
          {
            gameCode: gameCode,
            playerID: voteOut.playerID
          },
          {
            withCredentials: true
          }
        );
        socket.emit("markDead", voteOut.playerID);

        if (response.data.result !== "Continue") {
          socket.emit("endGame", {
            result: response.data.result,
            players: response.data.players
          });
        }
      }
    })

    socket.on("resumedPlaying", async () => {
      await axios.put("http://localhost:3000/games/changeStatus", {
        gameCode: gameCode,
        status: "playing"
      });
      setGameState({ screen: "playing" });
      setVoteOut(null);
      setIsAssassin(null);
    });

    return () => {
      socket.off("allVoted");
      socket.off("resumedPlaying");
    };
  }, [])

  const handleCastVote = async () => {
    if (!selectedPlayer) return;

    setVoted(true);

    const response = await axios.put("http://localhost:3000/players/castVote",
      {
        gameCode: gameCode,
        vote: selectedPlayer.playerID
      },
      { withCredentials: true }
    );

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
    await axios.put("http://localhost:3000/games/resetVotes", {
      gameCode: gameCode
    })
    await axios.put("http://localhost:3000/games/changeStatus", {
      gameCode: gameCode,
      status: "playing"
    });
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

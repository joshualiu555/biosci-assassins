import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket-io.ts";
import { Player, Game } from "../types.ts";

const Lobby = () => {
  const [game, setGame] = useState<Game>();
  const [player, setPlayer] = useState<Player>();
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get("http://localhost:3000/games/getGame", {
          withCredentials: true
        });
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
            gameCode: game.gameCode
          },
          withCredentials: true
        });
        // setPlayer(response.data.player);
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
        gameCode: game.gameCode
      },
      withCredentials: true,
    });
  };

  return (
    <div>
      <div>
        {game?.gameCode ?
          <p>{game.gameCode}</p>
          :
          <p>No game code yet...</p>}
      </div>
      <div>
        {players.length > 0 ?
          players.map((player) => <p key={player.playerID}>{player.name}</p>)
          :
          <p>No players yet...</p>
        }
      </div>
    </div>
  );
};

export default Lobby;

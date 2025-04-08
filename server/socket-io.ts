import { Server, Socket } from "socket.io";

const registerSocket = (io: Server, socket: Socket) => {
  socket.on("reconnect", ({ gameCode, playerID }) => {
    socket.data.gameCode = gameCode;
    socket.data.playerID = playerID;
    socket.join(gameCode);
  })

  socket.on("addPlayer", ({ gameCode, player }) => {
    socket.data.gameCode = gameCode;
    socket.data.playerID = player.playerID;
    socket.join(gameCode);
    socket.to(gameCode).emit("addedPlayer", player);
  });

  socket.on("removePlayer", () => {
    socket.to(socket.data.gameCode).emit("removedPlayer", socket.data.playerID);
    socket.leave(socket.data.gameCode);
  })

  socket.on("switchAdmin", updatedPlayers => {
    socket.to(socket.data.gameCode).emit("switchedAdmin", updatedPlayers);
  })

  socket.on("assignRoles", players => {
    io.in(socket.data.gameCode).emit("assignedRoles", players);
  })

  socket.on("startGame", () => {
    io.in(socket.data.gameCode).emit("startedGame");
  })

  socket.on("completeTask", tasksRemaining => {
    io.in(socket.data.gameCode).emit("completedTask", tasksRemaining);
  })

  socket.on("allVoted", ({ voteOut, isAssassin, players}) => {
    io.in(socket.data.gameCode).emit("allVoted", {
      voteOut: voteOut,
      isAssassin: isAssassin,
      players: players
    });
  })

  socket.on("endGame", data => {
    io.in(socket.data.gameCode).emit("endedGame", data);
  })
}

export default registerSocket;

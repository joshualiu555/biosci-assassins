import { Server, Socket } from "socket.io";

const registerSocket = (io: Server, socket: Socket) => {
  socket.on("reconnect", gameCode => {
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
}

export default registerSocket;

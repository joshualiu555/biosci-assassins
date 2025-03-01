import { Server, Socket } from "socket.io";

const registerPlayersSocket = (io: Server, socket: Socket) => {
  socket.on("addPlayer", ({ gameCode, player }) => {
    socket.data.gameCode = gameCode;
    socket.data.player = player;
    socket.join(gameCode);
    socket.to(gameCode).emit("addedPlayer", player);
  });

  socket.on("removePlayer", () => {
    socket.to(socket.data.gameCode).emit("removedPlayer", socket.data.player);
    socket.leave(socket.data.gameCode);
  })
}

export default registerPlayersSocket;

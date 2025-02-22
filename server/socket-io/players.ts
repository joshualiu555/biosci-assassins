import { Server, Socket } from "socket.io";

const registerPlayersSocket = (io: Server, socket: Socket) => {
  socket.on("addPlayer", ({ gameCode, player }) => {
    socket.join(gameCode);
    socket.to(gameCode).emit("addedPlayer", player);
  });
}

export default registerPlayersSocket;

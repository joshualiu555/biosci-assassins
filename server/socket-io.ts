import { Socket } from "socket.io";

const registerSocket = (socket: Socket) => {
  socket.on("reconnect", gameCode => {
    socket.join(gameCode);
  })

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

  socket.on("switchAdmin", updatedPlayers => {
    socket.to(socket.data.gameCode).emit("switchedAdmin", updatedPlayers);
  })

  socket.on("startGame", () => {
    socket.to(socket.data.gameCode).emit("startedGame");
  })
}

export default registerSocket;

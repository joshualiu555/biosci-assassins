import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cookieParser from "cookie-parser";
import { createClient } from "redis";

import { gamesRouter } from "./routes/games";
import { playersRouter } from "./routes/players";

const envPath = path.resolve(__dirname, "./.env");
dotenv.config( { path: envPath } );

const app = express();
app.use(express.json());
const corsOptions = {
  // TODO - Use environment variable
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/games", gamesRouter);
app.use("/players", playersRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // TODO - Use environment variable
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  }
});

import registerSocket from "./socket-io";
const onConnection = (socket: Socket) => {
  registerSocket(io, socket);
}
io.on("connection", onConnection);

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
});

httpServer.listen(process.env.PORT, () => {
  console.log("Server started")
});

mongoose
  .connect(process.env.MONGODB_URL as string)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log(error);
  });

const redisClient = createClient();
redisClient.connect()
  .then(() => {
    console.log("Redis connected");
  })
  .catch(() => {
    console.log("Failed to connect Redis");
  })
export { redisClient };

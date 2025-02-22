import express from "express";

import {
  createGame,
  getPlayers,
  validCode
} from "../controllers/games";

export const gamesRouter = express.Router();

gamesRouter.post("/createGame", createGame);
gamesRouter.get("/getPlayers", getPlayers);
gamesRouter.get("/validCode", validCode);

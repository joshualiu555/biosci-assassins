import express from "express";

import {
  createGame,
  getPlayers
} from "../controllers/games";

export const gamesRouter = express.Router();

gamesRouter.post("/createGame", createGame);
gamesRouter.get("/getPlayers", getPlayers);

import express from "express";

import {
  createGame,
  removeGame,
  gameExists,
  getPlayers,
  validCode
} from "../controllers/games";

export const gamesRouter = express.Router();

gamesRouter.post("/createGame", createGame);
gamesRouter.delete("/removeGame", removeGame);
gamesRouter.get("/gameExists", gameExists);
gamesRouter.get("/getPlayers", getPlayers);
gamesRouter.get("/validCode", validCode);

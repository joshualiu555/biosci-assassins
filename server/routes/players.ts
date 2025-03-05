import express from "express";

import {
  getPlayers,
  addPlayer,
  removePlayer,
  checkPlayerExists
} from "../controllers/players";

export const playersRouter = express.Router();

playersRouter.get("/getPlayers", getPlayers);
playersRouter.post("/addPlayer", addPlayer);
playersRouter.delete("/removePlayer", removePlayer);
playersRouter.get("/checkPlayerExists", checkPlayerExists);

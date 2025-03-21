import express from "express";

import {
  getPlayer,
  // getPlayers,
  addPlayer,
  removePlayer,
  checkPlayerExists
} from "../controllers/players";

export const playersRouter = express.Router();

playersRouter.get("/getPlayer", getPlayer);
// playersRouter.get("/getPlayers", getPlayers);
playersRouter.post("/addPlayer", addPlayer);
playersRouter.delete("/removePlayer", removePlayer);
playersRouter.get("/checkPlayerExists", checkPlayerExists);

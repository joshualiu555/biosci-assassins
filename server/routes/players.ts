import express from "express";

import {
  getPlayer,
  addPlayer,
  removePlayer,
  checkPlayerExists,
  markDead
} from "../controllers/players";

export const playersRouter = express.Router();

playersRouter.get("/getPlayer", getPlayer);
playersRouter.post("/addPlayer", addPlayer);
playersRouter.delete("/removePlayer", removePlayer);
playersRouter.get("/checkPlayerExists", checkPlayerExists);
playersRouter.put("/markDead", markDead);

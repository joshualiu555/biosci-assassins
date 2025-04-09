import express from "express";

import {
  getPlayer,
  addPlayer,
  removePlayer,
  removeRedisAndCookie,
  checkPlayerExists,
  markDead,
  castVote
} from "../controllers/players";

export const playersRouter = express.Router();

playersRouter.get("/getPlayer", getPlayer);
playersRouter.post("/addPlayer", addPlayer);
playersRouter.delete("/removePlayer", removePlayer);
playersRouter.delete("/removeRedisAndCookie", removeRedisAndCookie);
playersRouter.get("/checkPlayerExists", checkPlayerExists);
playersRouter.put("/markDead", markDead);
playersRouter.put("/castVote", castVote);

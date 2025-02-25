import express from "express";

import {
  addPlayer,
  removePlayer,
  checkPlayerExists
} from "../controllers/players";

export const playersRouter = express.Router();

playersRouter.post("/addPlayer", addPlayer);
playersRouter.delete("/removePlayer", removePlayer);
playersRouter.get("/checkPlayerExists", checkPlayerExists);

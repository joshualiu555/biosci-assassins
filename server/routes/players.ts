import express from "express";

import {
  addPlayer,
  checkPlayerExists
} from "../controllers/players";

export const playersRouter = express.Router();

playersRouter.post("/addPlayer", addPlayer);
playersRouter.get("/checkPlayerExists", checkPlayerExists);

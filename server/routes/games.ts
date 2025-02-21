import express from "express";

import {
  createGame
} from "../controllers/game";

export const gameRouter = express.Router();

gameRouter.post("/createGame", createGame);

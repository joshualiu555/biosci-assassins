import express from "express";

import {
  createGame
} from "../controllers/games";

export const gameRouter = express.Router();

gameRouter.post("/createGame", createGame);

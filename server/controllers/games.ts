import { Request, Response } from "express";
import { GameModel } from "../models/Game";

const createGame = async (req: Request, res: Response) => {
  const game = new GameModel(req.body);

  try {
    const response = await game.save();
    res.json(response);
  } catch (error) {
    res.json(error);
  }
}

export {
  createGame
}

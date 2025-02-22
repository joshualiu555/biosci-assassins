import { Request, Response } from "express";
import { GameModel } from "../models/Game";

const createGame = async (req: Request, res: Response) => {
  const game = new GameModel(req.body);

  console.log(game);

  try {
    const response = await game.save();
    console.log(response);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
}

const getPlayers = async (req: Request, res: Response) => {
  const { gameCode } = req.query;

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  res.json(game.players);
};

const validCode = async (req: Request, res: Response) => {
  const { gameCode } = req.query;

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (game && game.status == "waiting") {
    res.json({ result: "Valid code" });
  } else {
    res.json({ result: "Invalid code" });
  }
}

export {
  createGame,
  getPlayers,
  validCode
}

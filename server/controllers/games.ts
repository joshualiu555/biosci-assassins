import {Request, Response} from "express";
import {GameModel} from "../models/Game";

const createGame = async (req: Request, res: Response) => {
  console.log(req.body);

  const game = new GameModel(req.body);

  const response = await game.save();
  res.json(response);
}

const removeGame = async (gameCode: string) => {
  await GameModel.deleteOne({ gameCode: gameCode });
}

const gameExists = async (req: Request, res: Response) => {
  const { gameCode } = req.query;
  const game = await GameModel.findOne({ gameCode: gameCode });
  if (game) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
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
  removeGame,
  gameExists,
  getPlayers,
  validCode
}

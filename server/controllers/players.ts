import { Request, Response } from "express";
import { GameModel } from "../models/Game";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../index";

const addPlayer = async (req: Request, res: Response) => {
  const { gameCode, player } = req.body;

  player.id = uuidv4();

  try {
    const game = await GameModel.findOne({ gameCode: gameCode });
    if (!game) {
      res.json({ error: "Game not found" });
      return;
    }
    game.players.push(player);
    await game.save();

    const sessionID = uuidv4();
    res.cookie("sessionID", sessionID, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict",
      // TODO - Uncomment in production when you use https
      // secure: true
    });

    await redisClient.set(sessionID, player.id);

    res.json({ message: "Successfully added player" });
  } catch (error) {
    res.json(error);
  }
}

const checkPlayerExists = async (req: Request, res: Response) => {
  const { gameCode, playerName } = req.query;

  const game = await GameModel.findOne({ gameCode: gameCode });
  if (!game) {
    res.json({ error: "Game not found" });
    return;
  }

  const searchPlayer = game.players.find(player => player.name === playerName);
  // console.log(searchPlayer);
  if (searchPlayer) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
}

export {
  addPlayer,
  checkPlayerExists
}

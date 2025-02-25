import mongoose from "mongoose"

const GameSchema = new mongoose.Schema({
  gameCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["waiting", "playing", "townhall", "finished"],
    required: true
  },
  players: [
    {
      playerID: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      position: {
        type: String,
        enum: ["admin", "non-admin"],
        required: true
      },
      role: {
        type: String,
        enum: ["unassigned", "assassin", "crewmate"],
        required: true
      },
      status: {
        type: String,
        enum: ["alive", "dead"],
        required: true
      },
    },
  ],
  // TODO - Add locations
  numberAssassins: {
    type: Number,
    required: true
  },
  numberTasks: {
    type: Number,
    required: true
  },
  timeBetweenTasks: {
    type: Number,
    required: true
  },
  townhallTime: {
    type: Number,
    required: true
  },
  tasksRemaining: {
    type: Number,
    required: true
  },
})

export const GameModel = mongoose.model("games", GameSchema)

import mongoose from "mongoose"

const GameSchema = new mongoose.Schema({
  gameCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["lobby", "roles", "playing", "voting", "result"],
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
        enum: ["assassin", "crewmate"],
        required: true
      },
      status: {
        type: String,
        enum: ["alive", "dead"],
        required: true
      },
      // the vote string is the playerID
      vote: {
        type: String,
        required: false
      }
    },
  ],
  locations: [],
  numberAssassins: {
    type: Number,
    required: true
  },
  ejectionConfirmation: {
    type: Boolean,
    required: true
  },
  numberTasks: {
    type: Number,
    required: true
  },
  tasksRemaining: {
    type: Number,
    required: true
  }
})

export const GameModel = mongoose.model("games", GameSchema)

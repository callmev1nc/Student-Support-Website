import express from "express";
import { moodLog, addMood, getMood, moodSuggestions } from "../controllers/moodController.js";
import { authorise } from "../middleware/authorise.mjs";

export const moodRouter = express.Router();

// All mood routes require login (admin or student)
moodRouter.get("/", authorise(['admin', 'student']), moodLog);
moodRouter.get("/history", authorise(['admin', 'student']), getMood);
moodRouter.post("/add", authorise(['admin', 'student']), addMood);
moodRouter.get("/suggestions", authorise(['admin', 'student']), moodSuggestions);

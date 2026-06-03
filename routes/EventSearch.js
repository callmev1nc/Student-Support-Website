import express from "express";
import { addEvent, searchEvents, getAllEvents } from "../controllers/EventController.js";
import { authorise } from "../middleware/authorise.mjs";

export const eventRouter = express.Router();

// All event routes require login
eventRouter.get("/", authorise(['admin', 'student']), getAllEvents);
eventRouter.get("/search", authorise(['admin', 'student']), searchEvents);
// Only admins can add events
eventRouter.post("/", authorise(['admin']), addEvent);

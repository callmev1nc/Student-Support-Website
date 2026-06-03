import express from 'express';
import * as home from '../controllers/home.js';
import { moodSupport } from '../controllers/moodController.js';
import { authorise } from "../middleware/authorise.mjs";
import { userSession } from '../controllers/loginController.js';

export const homeRouter = express.Router();

// Home page — public, no auth required
homeRouter.get('/', home.index);
// Support page — available to all logged-in users
homeRouter.get('/support', authorise(['admin', 'student']), moodSupport);
// User profile — available to all logged-in users
homeRouter.get('/user-profile', authorise(['admin', 'student']), userSession);

import express from "express";
import * as register from "../controllers/registerController.js";

export const registerRouter = express.Router();

// Register page — public (guests only)
registerRouter.get('/', register.signup);
registerRouter.post('/home', register.registerUser);

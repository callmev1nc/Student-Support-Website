import express from "express";
import * as login from "../controllers/loginController.js";

export const loginRouter = express.Router();

// Login page — public (guests only)
loginRouter.get('/', login.signin);
loginRouter.post('/Dashboard', login.userLogin);

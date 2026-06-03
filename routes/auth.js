import express from "express";
import { signin, userLogin, registerPage, registerUser, userSession } from "../controllers/loginController.js";
import { authorise } from "../middleware/authorise.mjs";

export const authRouter = express.Router();

// Login routes — public
authRouter.get("/login", signin);
authRouter.post("/login", userLogin);

// Register routes — public
authRouter.get("/register", registerPage);
authRouter.post("/register", registerUser);

// User profile route — requires login
authRouter.get('/user-profile/:id?', authorise(['admin', 'student']), userSession);

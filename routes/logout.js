import express from "express";
import { authorise } from "../middleware/authorise.mjs";

export const logoutRouter = express.Router();

//Apply middleware to this route
//logoutRouter.use(authorise);

logoutRouter.get("/", (req, res) => {
  //console.log to see logout process in console
  console.log("Before logout, session:", req.session);
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.send("Error logging out");
    }
    //console.log to see in console that logout was successful
    console.log("Session destroyed successfully");
    res.redirect("/login");
  });
});

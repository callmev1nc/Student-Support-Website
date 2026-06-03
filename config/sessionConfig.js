import session from "express-session";
import cookieParser from "cookie-parser";

export const sessionMiddleware = {
  parser: cookieParser(),
  session: session({
    secret: process.env.SESSION_SECRET || "comp3028",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000, httpOnly: true } // 24 hours instead of 60 seconds
  })
};

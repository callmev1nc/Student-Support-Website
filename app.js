// DO NOT TOUCH THESE LINES
import * as server from "./config/server.js";
import debug from "debug";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// add imports here
import express from "express";
import bodyParser from "body-parser";

// Add import routes here
import { authRouter } from "./routes/auth.js";
import { homeRouter } from "./routes/home.js";
import { moodRouter } from "./routes/mood.js";
import { registerRouter } from "./routes/register.js";
import { loginRouter } from "./routes/login.js";
import { logoutRouter } from "./routes/logout.js";
import { eventRouter } from "./routes/EventSearch.js";
import { sessionMiddleware } from "./config/sessionConfig.js";

export const codeTrace = debug('comp3028:server');

export const app = express();
server.setup(app);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(sessionMiddleware.parser);
app.use(sessionMiddleware.session);

// This will make the user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use('/', authRouter);
app.use('/', homeRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use("/mood", moodRouter);
app.use("/logout", logoutRouter);
app.use("/events", eventRouter);

// DO NOT MODIFY BELOW HERE
// ####################################### No need to modify below this line #######################################
// Start the server
server.errorHandling(app);
export let runningServer;
if (process.env.NODE_ENV === 'test' || process.env.VERCEL) {
  codeTrace('Running in test/serverless mode - not starting server, just exporting app');
} else {
  runningServer = app.listen(server.port, () => {
    console.log(`Example app listening on port http://127.0.0.1:${server.port}`);
    debug('testing');
  });
}

export default app;

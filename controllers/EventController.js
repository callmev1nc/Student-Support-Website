import db from "../config/db.js"; // PostgreSQL connection

//ensure user is logged in
const ensureUser = (req, res) => {
  const user = req.session.user;
  if (!user) {
    res.redirect("/login");
    return null;
  }
  return user;
};

// Add Event (admin only)
export const addEvent = async (req, res) => {
  try {
    const user = ensureUser(req, res);
    if (!user) return;

    if (user.role !== "admin") {
      return res.status(403).send("Only admins can add events.");
    }

    const { title, type, date, description } = req.body;
    if (!title || !type || !date) {
      return res.status(400).send("Missing required fields");
    }

    await db`
      INSERT INTO events (event_title, event_description, event_date, user_id)
      VALUES (${title}, ${description || ""}, ${date}, ${user.user_id})
    `;

    console.log("Event added:", title);
    res.redirect("/events");
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).send("Error adding event");
  }
};

// Search Events (All users)
export const searchEvents = async (req, res) => {
  try {
    const user = ensureUser(req, res);
    if (!user) return;

    const { query } = req.query;
    let events;
    if (query) {
      events = await db`
        SELECT * FROM events
        WHERE LOWER(event_title) LIKE ${"%" + query.toLowerCase() + "%"}
        ORDER BY event_date DESC
      `;
    } else {
      events = await db`SELECT * FROM events ORDER BY event_date DESC`;
    }

    res.render("dashboard", { user, events });
  } catch (err) {
    console.error("Error searching events:", err);
    res.status(500).send("Error searching events");
  }
};

// Get All Events (Dashboard)
export const getAllEvents = async (req, res) => {
  try {
    const user = ensureUser(req, res);
    if (!user) return;

    const events = await db`SELECT * FROM events ORDER BY event_date DESC`;
    res.render("dashboard", { user, events });
  } catch (err) {
    console.error(" Error fetching events:", err);
    res.status(500).send("Error loading dashboard");
  }
};

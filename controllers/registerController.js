import sql from "../config/db.js";
import * as userService from "../services/userService.js";

export async function signup(req, res, next) {
  res.render('register', { title: 'Register', error: null });
}

export async function registerUser(req, res) {
  const { username, email, password, roleName } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.render('register', { title: 'Register', error: 'All fields are required' });
  }

  try {
    // Check if username already exists
    const existing = await sql`SELECT * FROM Users WHERE username = ${username}`;
    if (existing.length > 0) {
      return res.render('register', { title: 'Register', error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await sql`SELECT * FROM Users WHERE email = ${email}`;
    if (existingEmail.length > 0) {
      return res.render('register', { title: 'Register', error: 'Email already registered' });
    }

    // Find or create the role (default to 'student')
    const role = roleName || 'student';
    const roleResult = await sql`INSERT INTO Roles (roleName) VALUES (${role}) ON CONFLICT (roleName) DO NOTHING
      RETURNING role_id`;

    let roleId;

    if (roleResult.length > 0) {
      roleId = roleResult[0].role_id;
    } else {
      const existingRole = await sql`SELECT role_id FROM Roles WHERE roleName = ${role}`;
      roleId = existingRole[0]?.role_id;
    }

    if (!roleId) {
      console.error("Failed to find or create role");
      return res.status(500).send("Internal Server Error");
    }

    // Hash password
    const hashedPassword = await userService.hashPassword(password);

    // Insert user with role_id AND role column
    await sql`INSERT INTO Users (username, email, password_hash, role_id, role, date)
      VALUES (${username}, ${email}, ${hashedPassword}, ${roleId}, ${role}, ${new Date()})`;

    // Redirect to login page after successful registration
    res.redirect('/login');
  } catch (error) {
    console.error(`Failed to add user to DB: ${error}`);
    res.status(500).send("Internal Server Error");
  }
}

export async function returnHome(req, res) {
  res.render('home', { title: 'CampusWell' });
}

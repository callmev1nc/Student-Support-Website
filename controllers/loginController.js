import sql from "../config/db.js";
import * as userService from "../services/userService.js";

// Render login page
export async function signin(req, res) {
    res.render('login', { title: 'Login', error: null });
}

// Render register page
export async function registerPage(req, res) {
    res.render('register', { title: 'Register', error: null, user: req.session.user || null });
}

// Handle registration (used by /register POST route in auth.js)
export async function registerUser(req, res) {
    const { username, password } = req.body;

    try {
        // Check if username exists
        const existing = await sql`SELECT * FROM Users WHERE username = ${username}`;
        if (existing.length > 0) {
            return res.render('register', { title: 'Register', error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await userService.hashPassword(password);

        // Insert user with default 'student' role
        await sql`
            INSERT INTO Users (username, password_hash, role, email)
            VALUES (${username}, ${hashedPassword}, 'student', ${username + '@student.edu'})
        `;

        res.redirect('/login');
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).send("Server error");
    }
}

// Handle login
export async function userLogin(req, res) {
    const { username, password } = req.body;

    try {
        // Get user from DB
        const result = await sql`SELECT * FROM Users WHERE username = ${username}`;
        const user = result[0];

        if (!user) {
            return res.render('login', { title: 'Login', error: 'Invalid username or password' });
        }

        // Verify password
        const isValid = await userService.verifyPassword(user.password_hash, password);

        if (!isValid) {
            return res.render('login', { title: 'Login', error: 'Invalid username or password' });
        }

        // Store user in session — use actual 'role' column and 'date' column
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            role: user.role || 'student',
            email: user.email,
            date: user.date
        };

        // Redirect to events dashboard
        res.redirect('/events');
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Server error");
    }
}

// Render user profile — fetch from DB
export async function userSession(req, res) {
    try {
        const id = req.params.id || req.session.user?.user_id;

        if (id) {
            const result = await sql`SELECT * FROM Users WHERE user_id = ${id}`;
            if (result.length > 0) {
                return res.render('user-profile', { user: result[0] });
            }
        }

        // Fallback to session user
        res.render('user-profile', { user: req.session.user });
    } catch (err) {
        console.error("User profile error:", err);
        res.status(500).send("Server error");
    }
}

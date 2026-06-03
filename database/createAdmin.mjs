import sql from '../config/db.js';
import * as userService from '../services/userService.js';

async function createAdmin() {
  const username = 'admin123';
  const email = 'admin123@example.com';
  const password = 'admin123';
  const roleName = 'admin';

  try {
    // Check if admin user already exists
    const exists = await sql`SELECT * FROM Users WHERE username = ${username}`;
    if (exists.length) {
      console.log('Admin already exists:', exists[0]);
      await sql.end();
      return;
    }

    // Ensure the admin role exists
    await sql`
      INSERT INTO Roles (roleName)
      VALUES (${roleName})
      ON CONFLICT (roleName) DO NOTHING
    `;

    // Hash the password
    const hashedPassword = await userService.hashPassword(password);

    // Insert the admin user with both role_id and role column
    const user = await sql`
      INSERT INTO Users (username, email, password_hash, role_id, role, date)
      VALUES (
        ${username},
        ${email},
        ${hashedPassword},
        (SELECT role_id FROM Roles WHERE roleName = ${roleName}),
        ${roleName},
        ${new Date()}
      )
      RETURNING user_id
    `;

    console.log('Admin user created:', user[0]);
  } catch (err) {
    console.error('Failed to create admin:', err);
  } finally {
    await sql.end();
  }
}

// Run the script
createAdmin();

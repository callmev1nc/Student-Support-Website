import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import sql from '../config/db.js';
import * as userService from '../services/userService.js';

suite('Testing Register Module (SQL - temp user)', () => {
  const uniqueSuffix = Date.now().toString();
  const testRoleName = `test_role_${uniqueSuffix}`;
  const testUsername = `test_user_${uniqueSuffix}`;
  const testEmail = `test_${uniqueSuffix}@example.com`;
  const testPassword = 'TestPass!234';

  let insertedRoleId = null;
  let insertedUserId = null;

  async function registerUser(username, email, password, roleName) {
    if (!username || !email || !password || !roleName) return 'Missing fields';

    const roleInsert = await sql`
      INSERT INTO Roles (roleName)
      VALUES (${roleName})
      ON CONFLICT (roleName) DO NOTHING
      RETURNING role_id
    `;
    insertedRoleId = roleInsert[0]?.role_id ?? insertedRoleId;

    const hashed = await userService.hashPassword(password);

    const userInsert = await sql`
      INSERT INTO Users (username, email, password_hash, date)
      VALUES (${username}, ${email}, ${hashed}, ${new Date()})
      RETURNING user_id
    `;
    insertedUserId = userInsert[0].user_id;
    return 'User registered successfully';
  }

  before(async () => {
    const roleInsert = await sql`
      INSERT INTO Roles (roleName)
      VALUES (${testRoleName})
      ON CONFLICT (roleName) DO NOTHING
      RETURNING role_id
    `;
    insertedRoleId = roleInsert[0]?.role_id ?? null;
  });

  after(async () => {
    if (insertedUserId) await sql`DELETE FROM Users WHERE user_id = ${insertedUserId}`;
    if (insertedRoleId) await sql`DELETE FROM Roles WHERE role_id = ${insertedRoleId}`;
    if (sql.end) await sql.end();
  });

  test('Register user returns success message', async () => {
    const result = await registerUser(testUsername, testEmail, testPassword, testRoleName);
    assert.strictEqual(result, 'User registered successfully');
  });

  test('Register fails with missing fields', async () => {
    const result = await registerUser('', testEmail, testPassword, testRoleName);
    assert.strictEqual(result, 'Missing fields');
  });
});

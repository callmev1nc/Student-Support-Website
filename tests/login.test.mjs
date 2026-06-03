import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import sql from '../config/db.js';
import * as userService from '../services/userService.js';

suite('Testing Login Module (SQL - temp user)', () => {
  const uniqueSuffix = Date.now().toString();
  const testRoleName = `test_role_${uniqueSuffix}`;
  const testUsername = `test_user_${uniqueSuffix}`;
  const testEmail = `test_${uniqueSuffix}@example.com`;
  const testPassword = 'TestPass!234';

  let insertedRoleId = null;
  let insertedUserId = null;

  async function loginUser(username, password) {
    const result = await sql`SELECT * FROM Users WHERE username = ${username}`;
    const user = result[0];
    if (!user) return 'Wrong username or password';
    const isValid = await userService.verifyPassword(user.password_hash, password);
    if (!isValid) return 'Wrong username or password';
    return 'Login successful';
  }

  before(async () => {
    const roleInsert = await sql`
      INSERT INTO Roles (rolename)
      VALUES (${testRoleName})
      RETURNING role_id
    `;
    insertedRoleId = roleInsert[0].role_id;

    const hashed = await userService.hashPassword(testPassword);

    const userInsert = await sql`
      INSERT INTO Users (username, email, password_hash)
      VALUES (${testUsername}, ${testEmail}, ${hashed})
      RETURNING user_id
    `;
    insertedUserId = userInsert[0].user_id;
  });

  after(async () => {
    if (insertedUserId) await sql`DELETE FROM Users WHERE user_id = ${insertedUserId}`;
    if (insertedRoleId) await sql`DELETE FROM Roles WHERE role_id = ${insertedRoleId}`;

    if (sql.end) await sql.end(); // close DB connection if supported
  });

  test('Login succeeds with correct credentials', async () => {
    const result = await loginUser(testUsername, testPassword);
    assert.strictEqual(result, 'Login successful');
  });

  test('Login fails with wrong password', async () => {
    const result = await loginUser(testUsername, 'wrongpassword');
    assert.strictEqual(result, 'Wrong username or password');
  });

  test('Login fails with non-existent user', async () => {
    const result = await loginUser('definitely_no_such_user_12345', 'anyPass');
    assert.strictEqual(result, 'Wrong username or password');
  });
});

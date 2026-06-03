import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { app } from '../app.js';
import sql from '../config/db.js';
import * as userService from '../services/userService.js';

let runningServer;
let agent;
const testUser = {
  username: 'suggestion_tester',
  password: 'Test1234!',
  email: 'suggestion_tester@test.com',
};

suite('Suggestion Page', () => {
  before(async () => {
    runningServer = app.listen(0);

    // Insert testUser into DB
    const hashedPassword = await userService.hashPassword(testUser.password);
    await sql`INSERT INTO Users (username, password_hash, email)VALUES (${testUser.username}, ${hashedPassword}, ${testUser.email})`;

    agent = supertest.agent(app);
    await agent
      .post('/login/Dashboard')
      .send({ username: testUser.username, password: testUser.password })
      .expect(302);
  });

  after(async () => {
    await sql`DELETE FROM Users WHERE username = ${testUser.username}`;
    if (runningServer) await new Promise(resolve => runningServer.close(resolve));
    if (sql.end) await sql.end();
  });

  test('GET /mood/suggestions page should render', async () => {
    const res = await agent.get('/mood/suggestions');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Mood Suggestions Page'));
  });
});

import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { app } from '../app.js';
import sql from '../config/db.js';
import * as userService from '../services/userService.js';

let runningServer;
let agent;
const testUser = {
  username: 'testuser_mood',
  password: 'Test1234!',
  email: 'testuser_mood@test.com',
};

suite('Mood Routes', () => {
  before(async () => {
    runningServer = app.listen(0);

    // Hash password and insert user into DB
    const hashed = await userService.hashPassword(testUser.password);
    await sql`INSERT INTO Users (username, password_hash, email)
              VALUES (${testUser.username}, ${hashed}, ${testUser.email})`;

    // Create agent that keeps cookies between requests
    agent = supertest.agent(app);

    // Log the user in
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

  test('GET /mood should return mood logging page', async () => {
    const res = await agent.get('/mood');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Mood Logging Page'));
  });

  test('GET /mood/history should return mood history page', async () => {
    const res = await agent.get('/mood/history');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Mood History Page'));
  });

  test('POST /mood should log a new mood entry', async () => {
    const res = await agent
      .post('/mood/add')
      .send({ moods: 'happy', notes: 'Had a great day! (Test)' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.location, '/mood/history');
  });

  test('GET /mood/suggestions should return mood suggestions page', async () => {
    const res = await agent.get('/mood/suggestions');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Mood Suggestions Page'));
  });
});

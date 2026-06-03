import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../app.js';
import sql from '../config/db.js';

let runningServer;

suite('Register users', () => {
  before(() => {
    runningServer = app.listen(1); // use a random test port
  });

  after(async () => {
    // Close server
    if (runningServer) {
      await new Promise(resolve => runningServer.close(resolve));
    }

    //Close database connection
    if (sql.end) {
      await sql.end();
    }
  });

  test('GET /register should return register page', async () => {
    const res = await request(app).get('/register');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Register'));
  });

  test('POST /register should create a new user', async () => {
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      password: 'Test@1234',
      roleName: 'student'
    };

    const res = await request(app)
      .post('/register/home')
      .type('form')
      .send(testUser);
    assert.ok(
      res.status === 200 || res.status === 302,
      `Expected 200 or 302, got ${res.status}`
    );
  });

});

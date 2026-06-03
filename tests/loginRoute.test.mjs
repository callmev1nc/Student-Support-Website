import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../app.js';
import sql from '../config/db.js';

let runningServer;

suite('Login Routes', () => {
  before(() => {
    runningServer = app.listen(3);
  });

  after(async () => {
    //close server
    if (runningServer) {
      await new Promise(resolve => runningServer.close(resolve));
    }

    //close database connection
    if (sql.end) {
      await sql.end();
    }
  });

  test('GET /register should return register page', async () => {
    const res = await request(app).get('/register');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Register'));
  });

  test('GET /login should return login page', async () => {
    const res = await request(app).get('/login');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Login'));
  });



});
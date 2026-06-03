import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../app.js';
import sql from '../config/db.js';

let runningServer;

suite('Support Page', () => {
  before(() => {
    runningServer = app.listen(0); // Start server on a random test port
  });

  after(async () => {
    // Close server and DB
    if (runningServer) await new Promise(resolve => runningServer.close(resolve));
    if (sql.end) await sql.end();
  });
  test('GET /Support page should be rendered', async () => {
    const res = await request(app).get('/Support');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Support Page'));
  });
});
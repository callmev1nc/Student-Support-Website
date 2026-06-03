import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import db from '../config/db.js';
import * as userService from '../services/userService.js';

suite('Dashboard/Event Module (SQL)', () => {
  const uniqueSuffix = Date.now().toString();
  const adminUsername = `admin_${uniqueSuffix}`;
  const adminEmail = `admin_${uniqueSuffix}@example.com`;
  const adminPassword = 'AdminPass!234';
  let adminId = null;
  let eventId = null;

  // Simulate req/res
  function createReq(user, body = {}, query = {}) {
    return { session: { user }, body, query };
  }
  function createRes() {
    let state = {};
    return {
      status(code) { state.statusCode = code; return this; },
      send(msg) { state.msg = msg; return this; },
      redirect(url) { state.redirectUrl = url; return this; },
      render(view, data) { state.renderView = view; state.renderData = data; return this; },
      _getState() { return state; }
    };
  }

  before(async () => {
    // Setup admin role
    const roleInsert = await db`
      INSERT INTO Roles (rolename)
      VALUES ('admin')
      ON CONFLICT (rolename) DO NOTHING
      RETURNING role_id
    `;
    const roleId = roleInsert[0]?.role_id ?? (await db`SELECT role_id FROM Roles WHERE rolename = 'admin'`)[0].role_id;

    // Create admin user
    const hashed = await userService.hashPassword(adminPassword);
    const userInsert = await db`
      INSERT INTO Users (username, email, password_hash)
      VALUES (${adminUsername}, ${adminEmail}, ${hashed})
      RETURNING user_id
    `;
    adminId = userInsert[0].user_id;
  });

  after(async () => {
    // Cleanup
    if (eventId) await db`DELETE FROM events WHERE event_id = ${eventId}`;
    if (adminId) await db`DELETE FROM Users WHERE user_id = ${adminId}`;

    //close the database connection
    if (db.end) await db.end();
  });

  test('Admin can add event', async () => {
    const { addEvent } = await import('../controllers/EventController.js');
    const req = createReq({ user_id: adminId, role: 'admin', username: adminUsername }, {
      title: 'Test Event', type: 'gaming', date: '2025-10-20', description: 'Test Description'
    });
    const res = createRes();

    await addEvent(req, res);

    const events = await db`SELECT * FROM events WHERE event_title = 'Test Event' AND user_id = ${adminId}`;
    assert.ok(events.length === 1, 'Event was not added');
    eventId = events[0].event_id;
  });

  test('Non-admin cannot add event', async () => {
    const { addEvent } = await import('../controllers/EventController.js');
    const req = createReq({ user_id: adminId, role: 'student', username: 'testStudent' }, {
      title: 'Fail Event', type: 'gaming', date: '2025-10-21'
    });
    const res = createRes();

    await addEvent(req, res);
    const state = res._getState();
    assert.strictEqual(state.statusCode, 403, 'Non-admin should not be allowed to add event');
  });

});

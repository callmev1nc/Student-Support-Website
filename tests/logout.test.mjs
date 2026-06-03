import { suite, test, before, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { app } from '../app.js';
import sql from '../config/db.js';
import * as userService from '../services/userService.js';

let runningServer;
let agent;
const testUser = {
    username: 'testuser_logout',
    password: 'Test1234!',
    email: 'testuser_logout@test.com',
};
//Testing the logout function. Create user -> Login user -> Logout user -> Check redirect to login page
suite('Logout User', () => {
    before(async () => {
        runningServer = app.listen(0);
        // Hash test user password
        const hashedPassword = await userService.hashPassword(testUser.password);

        //insert testUser info into database
        await sql`INSERT INTO Users (username, password_hash, email) VALUES (${testUser.username}, ${hashedPassword}, ${testUser.email})`;

        agent = supertest.agent(app);

        await agent
            .post('/login/Dashboard')
            .send({ username: testUser.username, password: testUser.password })
            .expect(302);
    });


    after(async () => {
        // Remove testUser from database
        await sql`DELETE FROM Users WHERE username = ${testUser.username}`;

        if (runningServer) await new Promise(resolve => runningServer.close(resolve));

        if (sql.end) await sql.end();
    });

    test('GET /logout should destroy session and redirect to login', async () => {
        const res = await agent.get('/logout');

        // Should redirect to /login
        assert.strictEqual(res.status, 302);
        assert.strictEqual(res.headers.location, '/login');
    });
});

// migrationRunner.js

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import 'dotenv/config';

// Database connection — uses DATABASE_URL for Supabase or falls back to local PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

const sql = postgres(connectionString);

// Get the directory name for the migrations folder
const migrationsDir = path.join(import.meta.dirname, '../migrations');

async function applyMigrations() {
  try {
    // Get all SQL files in the migrations directory
    const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));

    // Sort files by name to ensure they are applied in the correct order
    files.sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sqlQuery = fs.readFileSync(filePath, 'utf8');

      console.log(`Applying migration: ${file}`);
      await sql.unsafe(sqlQuery);
      console.log(`Migration ${file} applied successfully.`);
    }

    console.log('All migrations applied successfully.');
  } catch (err) {
    console.error('Error applying migrations:', err);
  } finally {
    await sql.end();
  }
}

async function dropDatabase() {
  try {
    console.log('Dropping all tables...');

    // Get a list of all tables in the database
    const tables = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
      `;

    // Drop each table
    for (const table of tables) {
      await sql.unsafe(`DROP TABLE IF EXISTS ${table.table_name} CASCADE;`);
      console.log(`Dropped table: ${table.table_name}`);
    }

    console.log('All tables dropped successfully.');
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    await sql.end();
  }
}

// Handle command-line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Please provide a command: migrate or drop');
  process.exit(1);
}

const command = args[0];

if (command === 'migrate') {
  applyMigrations();
} else if (command === 'destroy') {
  dropDatabase();
} else {
  console.log('Invalid command. Use "migrate" to apply migrations or "destroy" to drop all tables.');
  process.exit(1);
}

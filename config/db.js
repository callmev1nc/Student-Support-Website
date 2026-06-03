import postgres from 'postgres';
import 'dotenv/config';

// Supabase / PostgreSQL connection
// Use DATABASE_URL env var for Supabase, or fall back to local PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

const sql = postgres(connectionString);

// Test the connection
(async () => {
  try {
    const result = await sql`SELECT NOW()`;
    console.log(`Database connection was successful at ${result[0].now}`);
  } catch (error) {
    console.error(`Failed to connect to the database: ${error.message}`);
  }
})();

export default sql;

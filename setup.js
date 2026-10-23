import { pool } from './db.js';

async function setup() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS feedback;
      CREATE TABLE feedback (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50),
        comment TEXT,
        secret_notes TEXT
      );
    `);

    // Insert dummy data
    await client.query(`
      INSERT INTO feedback (username, comment, secret_notes) VALUES
      ('alice', 'Great tutorial on SQL!', 'Alice is a VIP user'),
      ('bob', 'Having trouble with Docker.', 'Bob needs help with volumes'),
      ('charlie', 'Loved the container setup.', 'Charlie paid for premium');
    `);

    console.log('Database initialized successfully with dummy data!');
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
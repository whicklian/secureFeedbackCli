// app.js
import { pool } from './db.js';

// 1. DANGEROUS Search (Vulnerable to SQL Injection)
async function insecureSearch(searchTerm) {
  const client = await pool.connect();
  try {
    // String interpolation directly into SQL — VERY DANGEROUS
    const query = `SELECT * FROM feedback WHERE username = '${searchTerm}'`;
    console.log(`\n[INSECURE] Executing query: ${query}`);
    
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// 2. SECURE Search (Using Parameterization)
async function secureSearch(searchTerm) {
  const client = await pool.connect();
  try {
    // Parameter placeholder ($1) keeps code and data strictly separated
    const query = `SELECT * FROM feedback WHERE username = $1`;
    console.log(`\n[SECURE] Executing query with parameter:`, [searchTerm]);
    
    const result = await client.query(query, [searchTerm]);
    return result.rows;
  } finally {
    client.release();
  }
}

async function runDemo() {
  console.log(`=== POOL STATS: Total connections: ${pool.totalCount}, Idle: ${pool.idleCount} ===`);

  // --- TEST A: Normal Query ---
  const normalResult = await secureSearch('alice');
  console.log('Result for alice:', normalResult);

  // --- TEST B: SQL Injection Attack Simulation ---
  // A malicious user passes an input that closes the string and always evaluates to true (OR 1=1),
  // potentially dumping the entire table including secret notes!
  const maliciousInput = "x' OR '1'='1";

  // 1. Watch the insecure search fail / get compromised:
  try {
    const hackedResult = await insecureSearch(maliciousInput);
    console.log('🚨 INSECURE HACKED RESULTS (Ditched data exposed!):', hackedResult);
  } catch (err) {
    console.error(err);
  }

  // 2. Watch the secure search safely handle the malicious string as a literal username:
  try {
    const safeResult = await secureSearch(maliciousInput);
    console.log('🛡️ SECURE RESULTS (No data found, treated safely as text):', safeResult);
  } catch (err) {
    console.error(err);
  }

  console.log(`\n=== POOL STATS: Total connections: ${pool.totalCount}, Idle: ${pool.idleCount} ===`);
  await pool.end(); // Close pool cleanly
}

runDemo();
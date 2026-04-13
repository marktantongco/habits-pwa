#!/usr/bin/env node
/**
 * Habits PWA - Supabase Database Setup Script
 * 
 * Run this script from your local machine to create the database tables:
 *   node scripts/setup-database.js
 * 
 * Or run via psql:
 *   psql "postgresql://postgres:beginHabit1_1@db.hocjetqkgrptxdbsmmgx.supabase.co:5432/postgres" -f supabase-schema.sql
 * 
 * Or paste the SQL in the Supabase Dashboard SQL Editor:
 *   https://supabase.com/dashboard/project/hocjetqkgrptxdbsmmgx/sql
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:beginHabit1_1@db.hocjetqkgrptxdbsmmgx.supabase.co:5432/postgres';

async function setup() {
  console.log('========================================');
  console.log('  Habits PWA - Database Setup');
  console.log('========================================\n');

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database.\n');

    const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema SQL...');
    await client.query(sql);
    console.log('Schema applied successfully!\n');

    // Verify tables
    const { rows } = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log('Tables created:');
    rows.forEach(r => console.log(`  ✓ ${r.tablename}`));

    // Verify RLS policies
    const { rows: policies } = await client.query(
      "SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log(`\nRLS policies: ${policies.length} active`);

    console.log('\n========================================');
    console.log('  Database setup complete!');
    console.log('========================================');

  } catch (err) {
    console.error('\nError executing schema:', err.message);
    console.error('\nIf connection failed, try running manually:');
    console.error(`  psql "${DB_URL}" -f supabase-schema.sql`);
    console.error('\nOr paste the SQL in the Supabase Dashboard SQL Editor:');
    console.error('  https://supabase.com/dashboard/project/hocjetqkgrptxdbsmmgx/sql');
    process.exit(1);
  } finally {
    await client.end();
  }
}

setup();

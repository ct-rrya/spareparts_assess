import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

// load .env values into process.env without extra dependencies
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile();

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Missing DIRECT_URL or DATABASE_URL in .env');
    process.exit(1);
  }

  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  const client = new Client({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const schemaSql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'schema.sql'),
      'utf8'
    );
    const seedSql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'seed.sql'),
      'utf8'
    );

    console.log('Applying schema...');
    await client.query(schemaSql);

    console.log('Seeding data...');
    await client.query(seedSql);

    const counts = await client.query(`
      select
        (select count(*)::int from categories) as categories,
        (select count(*)::int from products) as products,
        (select count(*)::int from orders) as orders,
        (select count(*)::int from order_items) as order_items
    `);

    console.log('Seed complete:', counts.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Database seed failed:', err.message);
  process.exit(1);
});


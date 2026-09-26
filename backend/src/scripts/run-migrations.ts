/**
 * Standalone migration + seed runner that loads DATABASE_URL from .env.local
 * and uses the same migrations/seeds directories as the app.
 *
 * Usage: npx tsx src/scripts/run-migrations.ts
 */
import '../config/env'; // centralized env loading

import knex from 'knex';

const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'mineralinsight',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

const db = knex({
  client: 'pg',
  connection,
  migrations: { directory: './src/database/migrations', tableName: 'knex_migrations' },
  seeds: { directory: './src/database/seeds' },
});

async function main() {
  const step = process.argv[2] || 'all';

  if (step === 'migrate' || step === 'all') {
    console.log('→ Running migrations...');
    const [batch, migrations] = await db.migrate.latest();
    console.log(`✓ Migrations complete (batch ${batch}): ${migrations.join(', ') || 'none new'}`);
  }

  if (step === 'rollback') {
    console.log('→ Rolling back last migration batch...');
    await db.migrate.rollback();
    console.log('✓ Rollback complete');
    await db.destroy();
    return;
  }

  if (step === 'seed' || step === 'all') {
    console.log('→ Running seeds...');
    await db.seed.run();
    console.log('✓ Seeds complete');
  }

  // Quick verification summary
  const tables = ['users', 'minerals', 'countries', 'states', 'trade_data', 'price_data', 'production_data', 'risk_assessments', 'forecasts'];
  console.log('\n=== Data summary ===');
  for (const t of tables) {
    const [{ count }] = await db(t).count('* as count');
    console.log(`${t}: ${count}`);
  }

  await db.destroy();
}

main().catch(async (err) => {
  console.error('✗ Migration/seed failed:', err.message);
  await db.destroy();
  process.exit(1);
});

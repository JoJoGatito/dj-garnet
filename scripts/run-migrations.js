import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🗃️ Starting database migration...');

  // Check for DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('⚠️ No DATABASE_URL found, skipping migrations');
    return;
  }

  try {
    const sql = neon(databaseUrl);

    // Get migrations directory path
    const migrationsDir = path.resolve(__dirname, '../migrations');

    // Create migrations tracking table
    await sql`CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

    console.log('📁 Reading migration files...');

    // Read migration files
    const files = (await fs.readdir(migrationsDir))
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure deterministic order

    console.log(`📋 Found ${files.length} migration file(s)`);

    // Get already applied migrations
    const appliedResult = await sql`SELECT name FROM migrations;`;
    const applied = new Set(appliedResult.map(row => row.name));

    console.log(`✅ Already applied: ${appliedResult.length} migration(s)`);

    const appliedNow = [];
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`⏭️ Skipping already applied: ${file}`);
        continue;
      }

      console.log(`🚀 Applying migration: ${file}`);

      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = await fs.readFile(migrationPath, 'utf8');
      const statements = migrationSQL.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

      // Run migration inside transaction
      try {
        for (const statement of statements) {
          await sql`${statement}`;
        }
        await sql`INSERT INTO migrations (name) VALUES (${file});`;

        appliedNow.push(file);
        console.log(`✅ Successfully applied: ${file}`);
      } catch (error) {
        console.error(`❌ Migration failed: ${file}`);
        console.error('Error details:', error);
        throw new Error(`Migration failed: ${file}`);
      }
    }

    if (appliedNow.length > 0) {
      console.log(`🎉 Successfully applied ${appliedNow.length} new migration(s)`);
      console.log('Applied migrations:', appliedNow.join(', '));
    } else {
      console.log('ℹ️ No new migrations to apply');
    }

  } catch (error) {
    console.error('❌ Database migration error:', error);
    throw error;
  }
}

// Run the migrations
runMigrations().catch(error => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});
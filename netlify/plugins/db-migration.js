const fs = require('fs').promises;
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');

module.exports = {
  onPreBuild: async ({ constants, utils }) => {
    console.log('🗃️ Starting database migration...');

    // Only run migrations if DATABASE_URL is available
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('⚠️ No DATABASE_URL found, skipping migrations');
      return;
    }

    try {
      const sql = neon(databaseUrl);
      const db = drizzle(sql);

      // Get migrations directory path
      const migrationsDir = path.resolve(process.cwd(), 'migrations');

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

        // Run migration inside transaction
        try {
          await sql.begin(async (tx) => {
            // Apply the migration SQL
            await tx.execute(migrationSQL);

            // Record that this migration was applied
            await tx`INSERT INTO migrations (name) VALUES (${file});`;
          });

          appliedNow.push(file);
          console.log(`✅ Successfully applied: ${file}`);
        } catch (error) {
          console.error(`❌ Migration failed: ${file}`);
          console.error('Error details:', error);

          // Cancel the build on migration failure
          utils.build.failPlugin(
            `Database migration failed: ${file}`,
            { error }
          );
          return;
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
      utils.build.failPlugin(
        'Database migration failed',
        { error }
      );
    }
  }
};
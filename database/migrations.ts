import { getDatabase } from './init';

export interface Migration {
  version: number;
  up: (db: any) => Promise<void>;
  down?: (db: any) => Promise<void>;
}

const migrations: Migration[] = [
  // Future migrations can be added here
  // Example:
  // {
  //   version: 1,
  //   up: async (db) => {
  //     await db.execAsync('ALTER TABLE Profiles ADD COLUMN new_field TEXT');
  //   },
  //   down: async (db) => {
  //     await db.execAsync('ALTER TABLE Profiles DROP COLUMN new_field');
  //   },
  // },
];

export async function runMigrations(): Promise<void> {
  const db = getDatabase();

  // Create migrations table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);

  // Get current version
  const result = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM migrations'
  );
  const currentVersion = result?.version || 0;

  // Run pending migrations
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      await migration.up(db);
      await db.runAsync(
        'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
        [migration.version, Date.now()]
      );
    }
  }
}

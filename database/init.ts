import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('aac.db');
  await createSchema(db);
  return db;
}

async function createSchema(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS Profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      avatar_path TEXT,
      settings_json TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS Boards (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      is_core INTEGER DEFAULT 0,
      grid_cols INTEGER DEFAULT 4,
      grid_rows INTEGER DEFAULT 4,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Buttons (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL,
      label TEXT NOT NULL,
      speech_text TEXT NOT NULL,
      image_path TEXT NOT NULL,
      symbol_path TEXT,
      position INTEGER NOT NULL,
      color TEXT,
      is_pinned INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (board_id) REFERENCES Boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Routines (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      pinned_button_ids_json TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MediaAssets (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('photo', 'symbol')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Utterances (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      routine_id TEXT,
      FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (routine_id) REFERENCES Routines(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS SubscriptionStatus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL CHECK(status IN ('uninitialized', 'trial_active', 'active_subscribed', 'grace_period', 'expired_limited_mode')),
      expires_at INTEGER,
      product_id TEXT,
      last_validated_at INTEGER NOT NULL,
      trial_started_at INTEGER,
      grace_period_ends_at INTEGER,
      cached_entitlements_json TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS UsageLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      metadata_json TEXT DEFAULT '{}',
      FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_boards_profile_id ON Boards(profile_id);
    CREATE INDEX IF NOT EXISTS idx_buttons_board_id ON Buttons(board_id);
    CREATE INDEX IF NOT EXISTS idx_buttons_position ON Buttons(board_id, position);
    CREATE INDEX IF NOT EXISTS idx_routines_profile_id ON Routines(profile_id);
    CREATE INDEX IF NOT EXISTS idx_media_assets_profile_id ON MediaAssets(profile_id);
    CREATE INDEX IF NOT EXISTS idx_utterances_profile_id ON Utterances(profile_id);
    CREATE INDEX IF NOT EXISTS idx_utterances_timestamp ON Utterances(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_profile_id ON UsageLogs(profile_id);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON UsageLogs(timestamp DESC);
  `);
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

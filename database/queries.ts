import { getDatabase } from './init';
import type {
  Profile,
  Board,
  Button,
  Routine,
  MediaAsset,
  Utterance,
  UsageLog,
} from './types';

// Profile queries
export async function createProfile(
  id: string,
  name: string,
  avatar_path: string | null = null
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO Profiles (id, name, created_at, avatar_path, settings_json) VALUES (?, ?, ?, ?, ?)',
    [id, name, Date.now(), avatar_path, JSON.stringify({})]
  );
}

export async function getProfile(id: string): Promise<Profile | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Profile>('SELECT * FROM Profiles WHERE id = ?', [id]);
}

export async function getAllProfiles(): Promise<Profile[]> {
  const db = getDatabase();
  return await db.getAllAsync<Profile>('SELECT * FROM Profiles ORDER BY created_at DESC');
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<Profile, 'name' | 'avatar_path' | 'settings_json'>>
): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.avatar_path !== undefined) {
    fields.push('avatar_path = ?');
    values.push(updates.avatar_path);
  }
  if (updates.settings_json !== undefined) {
    fields.push('settings_json = ?');
    values.push(updates.settings_json);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE Profiles SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteProfile(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM Profiles WHERE id = ?', [id]);
}

// Board queries
export async function createBoard(
  id: string,
  profile_id: string,
  name: string,
  is_core: boolean = false,
  grid_cols: number = 4,
  grid_rows: number = 4
): Promise<void> {
  const db = getDatabase();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO Boards (id, profile_id, name, is_core, grid_cols, grid_rows, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, profile_id, name, is_core ? 1 : 0, grid_cols, grid_rows, now, now]
  );
}

export async function getBoard(id: string): Promise<Board | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Board>('SELECT * FROM Boards WHERE id = ?', [id]);
}

export async function getBoardsByProfile(profile_id: string): Promise<Board[]> {
  const db = getDatabase();
  return await db.getAllAsync<Board>(
    'SELECT * FROM Boards WHERE profile_id = ? ORDER BY is_core DESC, created_at ASC',
    [profile_id]
  );
}

export async function getCoreBoard(profile_id: string): Promise<Board | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Board>(
    'SELECT * FROM Boards WHERE profile_id = ? AND is_core = 1 LIMIT 1',
    [profile_id]
  );
}

export async function updateBoard(
  id: string,
  updates: Partial<Pick<Board, 'name' | 'grid_cols' | 'grid_rows'>>
): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.grid_cols !== undefined) {
    fields.push('grid_cols = ?');
    values.push(updates.grid_cols);
  }
  if (updates.grid_rows !== undefined) {
    fields.push('grid_rows = ?');
    values.push(updates.grid_rows);
  }

  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    await db.runAsync(`UPDATE Boards SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteBoard(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM Boards WHERE id = ?', [id]);
}

// Button queries
export async function createButton(
  id: string,
  board_id: string,
  label: string,
  speech_text: string,
  image_path: string,
  position: number,
  symbol_path: string | null = null,
  color: string | null = null
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO Buttons (id, board_id, label, speech_text, image_path, symbol_path, position, color, is_pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, board_id, label, speech_text, image_path, symbol_path, position, color, 0, Date.now()]
  );
}

export async function getButton(id: string): Promise<Button | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Button>('SELECT * FROM Buttons WHERE id = ?', [id]);
}

export async function getButtonsByBoard(board_id: string): Promise<Button[]> {
  const db = getDatabase();
  return await db.getAllAsync<Button>(
    'SELECT * FROM Buttons WHERE board_id = ? ORDER BY position ASC',
    [board_id]
  );
}

export async function updateButton(
  id: string,
  updates: Partial<
    Pick<Button, 'label' | 'speech_text' | 'image_path' | 'symbol_path' | 'position' | 'color' | 'is_pinned'>
  >
): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.label !== undefined) {
    fields.push('label = ?');
    values.push(updates.label);
  }
  if (updates.speech_text !== undefined) {
    fields.push('speech_text = ?');
    values.push(updates.speech_text);
  }
  if (updates.image_path !== undefined) {
    fields.push('image_path = ?');
    values.push(updates.image_path);
  }
  if (updates.symbol_path !== undefined) {
    fields.push('symbol_path = ?');
    values.push(updates.symbol_path);
  }
  if (updates.position !== undefined) {
    fields.push('position = ?');
    values.push(updates.position);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.is_pinned !== undefined) {
    fields.push('is_pinned = ?');
    values.push(updates.is_pinned ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(`UPDATE Buttons SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteButton(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM Buttons WHERE id = ?', [id]);
}

// Routine queries
export async function createRoutine(
  id: string,
  profile_id: string,
  name: string,
  pinned_button_ids: string[] = []
): Promise<void> {
  const db = getDatabase();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO Routines (id, profile_id, name, pinned_button_ids_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, profile_id, name, JSON.stringify(pinned_button_ids), now, now]
  );
}

export async function getRoutine(id: string): Promise<Routine | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Routine>('SELECT * FROM Routines WHERE id = ?', [id]);
}

export async function getRoutinesByProfile(profile_id: string): Promise<Routine[]> {
  const db = getDatabase();
  return await db.getAllAsync<Routine>(
    'SELECT * FROM Routines WHERE profile_id = ? ORDER BY created_at ASC',
    [profile_id]
  );
}

export async function updateRoutine(
  id: string,
  updates: Partial<Pick<Routine, 'name' | 'pinned_button_ids_json'>>
): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.pinned_button_ids_json !== undefined) {
    fields.push('pinned_button_ids_json = ?');
    values.push(updates.pinned_button_ids_json);
  }

  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    await db.runAsync(`UPDATE Routines SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteRoutine(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM Routines WHERE id = ?', [id]);
}

// MediaAsset queries
export async function createMediaAsset(
  id: string,
  profile_id: string,
  file_path: string,
  type: 'photo' | 'symbol'
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO MediaAssets (id, profile_id, file_path, type, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, profile_id, file_path, type, Date.now()]
  );
}

export async function getMediaAssetsByProfile(
  profile_id: string,
  type?: 'photo' | 'symbol'
): Promise<MediaAsset[]> {
  const db = getDatabase();
  if (type) {
    return await db.getAllAsync<MediaAsset>(
      'SELECT * FROM MediaAssets WHERE profile_id = ? AND type = ? ORDER BY created_at DESC',
      [profile_id, type]
    );
  }
  return await db.getAllAsync<MediaAsset>(
    'SELECT * FROM MediaAssets WHERE profile_id = ? ORDER BY created_at DESC',
    [profile_id]
  );
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM MediaAssets WHERE id = ?', [id]);
}

// Utterance queries
export async function createUtterance(
  id: string,
  profile_id: string,
  text: string,
  routine_id: string | null = null
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO Utterances (id, profile_id, text, timestamp, routine_id) VALUES (?, ?, ?, ?, ?)',
    [id, profile_id, text, Date.now(), routine_id]
  );
}

export async function getUtterancesByProfile(
  profile_id: string,
  limit: number = 100
): Promise<Utterance[]> {
  const db = getDatabase();
  return await db.getAllAsync<Utterance>(
    'SELECT * FROM Utterances WHERE profile_id = ? ORDER BY timestamp DESC LIMIT ?',
    [profile_id, limit]
  );
}

// UsageLog queries
export async function createUsageLog(
  profile_id: string,
  event_type: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO UsageLogs (profile_id, event_type, timestamp, metadata_json) VALUES (?, ?, ?, ?)',
    [profile_id, event_type, Date.now(), JSON.stringify(metadata)]
  );
}

export async function getUsageLogsByProfile(
  profile_id: string,
  limit: number = 1000
): Promise<UsageLog[]> {
  const db = getDatabase();
  return await db.getAllAsync<UsageLog>(
    'SELECT * FROM UsageLogs WHERE profile_id = ? ORDER BY timestamp DESC LIMIT ?',
    [profile_id, limit]
  );
}

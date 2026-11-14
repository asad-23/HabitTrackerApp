import { Platform } from 'react-native';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'twice.db';

type TwiceDatabase = ExpoSQLiteDatabase<typeof schema>;

let instance: TwiceDatabase | null = null;

function open(): TwiceDatabase {
  const sqlite = openDatabaseSync(DATABASE_NAME);
  sqlite.execSync('PRAGMA journal_mode = WAL;');
  sqlite.execSync('PRAGMA foreign_keys = ON;');
  return drizzle(sqlite, { schema });
}

// Native can open synchronously at startup, exactly as before.
if (Platform.OS !== 'web') {
  instance = open();
}

/**
 * Web only: the synchronous SQLite bridge spins the main thread and gives up
 * after roughly 66 ms, which is shorter than a cold worker + WASM start. Warm
 * the worker with an async open first, then switch to the sync connection the
 * Drizzle driver expects. Native already opened above, so this is a no-op.
 */
export async function initDatabase(): Promise<void> {
  if (Platform.OS !== 'web' || instance) return;

  const warm = await openDatabaseAsync(DATABASE_NAME);
  await warm.closeAsync();
  instance = open();
}

/**
 * Repositories import `db` at module scope, so a proxy keeps that shape while
 * allowing the web connection to be created after an async warm-up.
 */
export const db = new Proxy({} as TwiceDatabase, {
  get(_target, property) {
    if (!instance) {
      throw new Error('The notebook is still opening.');
    }
    const value = Reflect.get(instance, property);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

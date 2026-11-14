import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { db } from '@/db/client';
import { checkIns, habits, reflections } from '@/db/schema';
import { todayKey } from '@/domain/dates';

const BACKUP_APP = 'twice';
const BACKUP_VERSION = 1;

type BackupFile = {
  app: string;
  version: number;
  exportedAt: string;
  habits: unknown[];
  checkIns: unknown[];
  reflections: unknown[];
};

function isBackupFile(value: unknown): value is BackupFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Partial<BackupFile>;
  return (
    file.app === BACKUP_APP &&
    file.version === BACKUP_VERSION &&
    Array.isArray(file.habits) &&
    Array.isArray(file.checkIns) &&
    Array.isArray(file.reflections)
  );
}

export type BackupSummary = {
  habits: number;
  checkIns: number;
  reflections: number;
};

/** Writes a readable JSON file and hands it to the system share sheet. */
export async function exportBackup(): Promise<BackupSummary> {
  const data: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    habits: db.select().from(habits).all(),
    checkIns: db.select().from(checkIns).all(),
    reflections: db.select().from(reflections).all(),
  };

  const file = new File(Paths.cache, `twice-backup-${todayKey()}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(data, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Save your Twice backup',
      UTI: 'public.json',
    });
  }

  return {
    habits: data.habits.length,
    checkIns: data.checkIns.length,
    reflections: data.reflections.length,
  };
}

export type ImportResult = BackupSummary | { canceled: true };

/**
 * Replaces the notebook with a backup. The caller must confirm with the user
 * first: this is destructive by design so a restore is a clean state.
 */
export async function importBackup(): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (picked.canceled) return { canceled: true };
  const asset = picked.assets[0];
  if (!asset) throw new Error('No file was chosen.');

  const text = await new File(asset.uri).text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not a Twice backup.');
  }

  if (!isBackupFile(parsed)) {
    throw new Error('That file is not a Twice backup.');
  }

  const summary: BackupSummary = {
    habits: parsed.habits.length,
    checkIns: parsed.checkIns.length,
    reflections: parsed.reflections.length,
  };

  db.transaction((tx) => {
    tx.delete(checkIns).run();
    tx.delete(reflections).run();
    tx.delete(habits).run();

    if (parsed.habits.length > 0) {
      tx.insert(habits).values(parsed.habits as never).run();
    }
    if (parsed.checkIns.length > 0) {
      tx.insert(checkIns).values(parsed.checkIns as never).run();
    }
    if (parsed.reflections.length > 0) {
      tx.insert(reflections).values(parsed.reflections as never).run();
    }
  });

  return summary;
}

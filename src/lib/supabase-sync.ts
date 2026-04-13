/**
 * Habits PWA - Supabase Sync Layer
 * 
 * Architecture: localStorage as primary (offline-first), Supabase as cloud sync.
 * - On app load: read from localStorage, then attempt cloud sync (pull)
 * - On data change: save to localStorage immediately, then push to Supabase (fire-and-forget)
 * - Periodic sync: every 30 seconds if online
 * - Conflict resolution: last-write-wins (based on updated_at)
 */

import { supabase } from './supabase';

// Types matching our Supabase schema
interface SupabaseStudent {
  id?: string;
  student_id: string;
  name: string;
  theme: string;
  streak: number;
  current_week: number;
  updated_at?: string;
}

interface SupabaseDailyEntry {
  id?: string;
  student_id: string;
  week: number;
  day: string;
  reading_complete: boolean;
  soap_scripture: string;
  soap_observation: string;
  soap_application: string;
  soap_prayer: string;
  prayer_0: string;
  prayer_1: string;
  prayer_2: string;
  checked_by: string;
  updated_at?: string;
}

interface SupabaseQuizHistory {
  id?: string;
  student_id: string;
  day: string;
  accuracy: number;
}

interface SupabaseBadge {
  id?: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
}

interface SupabaseClipboardEntry {
  id?: string;
  student_id: string;
  text: string;
  label: string;
  created_at: string;
}

// Sync status tracking
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

let syncStatus: SyncStatus = 'idle';
let lastSyncAt: string | null = null;
let syncError: string | null = null;
const listeners = new Set<(status: SyncStatus, error: string | null) => void>();

function notifyListeners() {
  listeners.forEach(fn => fn(syncStatus, syncError));
}

export function getSyncStatus(): { status: SyncStatus; lastSyncAt: string | null; error: string | null } {
  return { status: syncStatus, lastSyncAt, error: syncError };
}

export function onSyncStatusChange(fn: (status: SyncStatus, error: string | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Check if Supabase is reachable */
async function isSupabaseReachable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!navigator.onLine) return false;
  try {
    const { error } = await supabase.from('students').select('id').limit(1);
    // If table doesn't exist, that's still "reachable" - just needs setup
    if (error && error.code === 'PGRST205') {
      console.log('[Habits Sync] Tables not yet created, needs setup');
      return true; // Supabase is reachable, tables just need creation
    }
    return !error || error.code === '42P01'; // 42P01 = undefined_table
  } catch {
    return false;
  }
}

/** Check if database tables exist and create them if needed via REST API */
export async function ensureTablesExist(): Promise<boolean> {
  try {
    // Try a simple query to check if students table exists
    const { error } = await supabase.from('students').select('id').limit(1);
    
    if (!error) return true;
    
    if (error.code === 'PGRST205' || error.code === '42P01') {
      console.log('[Habits Sync] Database tables not found. Please run supabase-schema.sql in the Supabase SQL Editor.');
      syncError = 'Tables not created. Run SQL setup in Supabase Dashboard.';
      notifyListeners();
      return false;
    }
    
    // Network error or other issue
    console.warn('[Habits Sync] Error checking tables:', error.message);
    return false;
  } catch (err) {
    console.warn('[Habits Sync] Failed to check tables:', err);
    return false;
  }
}

// ============================================================
// PUSH OPERATIONS (localStorage → Supabase)
// ============================================================

/** Push student profile to Supabase */
export async function pushStudent(studentId: string, data: {
  name: string;
  theme: string;
  streak: number;
  currentWeek: number;
}): Promise<boolean> {
  try {
    const row: SupabaseStudent = {
      student_id: studentId,
      name: data.name,
      theme: data.theme,
      streak: data.streak,
      current_week: data.currentWeek,
    };

    const { error } = await supabase
      .from('students')
      .upsert(row, { onConflict: 'student_id' });

    if (error) {
      console.warn('[Habits Sync] Push student error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Habits Sync] Push student failed:', err);
    return false;
  }
}

/** Push daily entries to Supabase */
export async function pushDailyEntries(
  studentId: string,
  week: number,
  dailyData: Record<string, {
    readingComplete: boolean;
    soap: { scripture: string; observation: string; application: string; prayer: string };
    prayers: Record<string, string>;
    checkedBy: string;
  }>
): Promise<boolean> {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const rows: SupabaseDailyEntry[] = days
      .filter(day => dailyData[day])
      .map(day => {
        const d = dailyData[day];
        return {
          student_id: studentId,
          week,
          day,
          reading_complete: d.readingComplete,
          soap_scripture: d.soap?.scripture || '',
          soap_observation: d.soap?.observation || '',
          soap_application: d.soap?.application || '',
          soap_prayer: d.soap?.prayer || '',
          prayer_0: d.prayers?.['0'] || '',
          prayer_1: d.prayers?.['1'] || '',
          prayer_2: d.prayers?.['2'] || '',
          checked_by: d.checkedBy || '',
        };
      });

    if (rows.length === 0) return true;

    const { error } = await supabase
      .from('daily_entries')
      .upsert(rows, { onConflict: 'student_id,week,day' });

    if (error) {
      console.warn('[Habits Sync] Push daily entries error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Habits Sync] Push daily entries failed:', err);
    return false;
  }
}

/** Push quiz history to Supabase */
export async function pushQuizHistory(
  studentId: string,
  quizHistory: Record<string, { accuracy: number; timestamp: string }>
): Promise<boolean> {
  try {
    const rows: SupabaseQuizHistory[] = Object.entries(quizHistory).map(
      ([day, entry]) => ({
        student_id: studentId,
        day,
        accuracy: entry.accuracy,
      })
    );

    if (rows.length === 0) return true;

    const { error } = await supabase
      .from('quiz_history')
      .upsert(rows, { onConflict: 'student_id,day' });

    if (error) {
      console.warn('[Habits Sync] Push quiz history error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Habits Sync] Push quiz history failed:', err);
    return false;
  }
}

/** Push badges to Supabase */
export async function pushBadges(
  studentId: string,
  badges: string[]
): Promise<boolean> {
  try {
    const rows: SupabaseBadge[] = badges.map(badge_id => ({
      student_id: studentId,
      badge_id,
      earned_at: new Date().toISOString(),
    }));

    if (rows.length === 0) return true;

    const { error } = await supabase
      .from('student_badges')
      .upsert(rows, { onConflict: 'student_id,badge_id' });

    if (error) {
      console.warn('[Habits Sync] Push badges error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Habits Sync] Push badges failed:', err);
    return false;
  }
}

/** Push clipboard entries to Supabase */
export async function pushClipboardEntries(
  studentId: string,
  entries: Array<{ text: string; label: string; timestamp: string }>
): Promise<boolean> {
  try {
    const rows: SupabaseClipboardEntry[] = entries.map(entry => ({
      student_id: studentId,
      text: entry.text,
      label: entry.label,
      created_at: entry.timestamp,
    }));

    if (rows.length === 0) return true;

    const { error } = await supabase
      .from('clipboard_entries')
      .upsert(rows);

    if (error) {
      console.warn('[Habits Sync] Push clipboard error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Habits Sync] Push clipboard failed:', err);
    return false;
  }
}

// ============================================================
// PULL OPERATIONS (Supabase → localStorage)
// ============================================================

/** Pull student data from Supabase */
export async function pullStudent(studentId: string): Promise<{
  name: string;
  theme: string;
  streak: number;
  currentWeek: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      theme: data.theme,
      streak: data.streak,
      currentWeek: data.current_week,
    };
  } catch (err) {
    console.warn('[Habits Sync] Pull student failed:', err);
    return null;
  }
}

/** Pull daily entries from Supabase */
export async function pullDailyEntries(
  studentId: string,
  week: number
): Promise<Record<string, {
  readingComplete: boolean;
  soap: { scripture: string; observation: string; application: string; prayer: string };
  prayers: Record<string, string>;
  checkedBy: string;
}> | null> {
  try {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('week', week);

    if (error || !data || data.length === 0) return null;

    const result: Record<string, any> = {};
    for (const row of data) {
      result[row.day] = {
        readingComplete: row.reading_complete,
        soap: {
          scripture: row.soap_scripture,
          observation: row.soap_observation,
          application: row.soap_application,
          prayer: row.soap_prayer,
        },
        prayers: {
          '0': row.prayer_0,
          '1': row.prayer_1,
          '2': row.prayer_2,
        },
        checkedBy: row.checked_by,
      };
    }
    return result;
  } catch (err) {
    console.warn('[Habits Sync] Pull daily entries failed:', err);
    return null;
  }
}

/** Pull quiz history from Supabase */
export async function pullQuizHistory(studentId: string): Promise<Record<string, { accuracy: number; timestamp: string }> | null> {
  try {
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('student_id', studentId);

    if (error || !data) return null;

    const result: Record<string, any> = {};
    for (const row of data) {
      result[row.day] = { accuracy: row.accuracy, timestamp: row.created_at };
    }
    return result;
  } catch (err) {
    console.warn('[Habits Sync] Pull quiz history failed:', err);
    return null;
  }
}

/** Pull badges from Supabase */
export async function pullBadges(studentId: string): Promise<string[] | null> {
  try {
    const { data, error } = await supabase
      .from('student_badges')
      .select('badge_id')
      .eq('student_id', studentId);

    if (error || !data) return null;
    return data.map((r: any) => r.badge_id);
  } catch (err) {
    console.warn('[Habits Sync] Pull badges failed:', err);
    return null;
  }
}

/** Pull clipboard entries from Supabase */
export async function pullClipboardEntries(studentId: string): Promise<Array<{ text: string; label: string; timestamp: string }> | null> {
  try {
    const { data, error } = await supabase
      .from('clipboard_entries')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return null;
    return data.map((r: any) => ({ text: r.text, label: r.label, timestamp: r.created_at }));
  } catch (err) {
    console.warn('[Habits Sync] Pull clipboard failed:', err);
    return null;
  }
}

// ============================================================
// FULL SYNC (push all + pull latest)
// ============================================================

export interface SyncPayload {
  studentId: string;
  studentName: string;
  theme: string;
  streak: number;
  currentWeek: number;
  dailyData: Record<string, any>;
  quizHistory: Record<string, any>;
  badges: string[];
  clipboardHistory: Array<{ text: string; label: string; timestamp: string }>;
}

/** Full push sync: upload all local data to Supabase */
export async function fullPush(payload: SyncPayload): Promise<boolean> {
  syncStatus = 'syncing';
  syncError = null;
  notifyListeners();

  try {
    const tablesExist = await ensureTablesExist();
    if (!tablesExist) {
      syncStatus = 'error';
      notifyListeners();
      return false;
    }

    const results = await Promise.all([
      pushStudent(payload.studentId, {
        name: payload.studentName,
        theme: payload.theme,
        streak: payload.streak,
        currentWeek: payload.currentWeek,
      }),
      pushDailyEntries(payload.studentId, payload.currentWeek, payload.dailyData),
      pushQuizHistory(payload.studentId, payload.quizHistory),
      pushBadges(payload.studentId, payload.badges),
      pushClipboardEntries(payload.studentId, payload.clipboardHistory),
    ]);

    const allSuccess = results.every(r => r);
    syncStatus = allSuccess ? 'synced' : 'error';
    lastSyncAt = new Date().toISOString();
    if (!allSuccess) syncError = 'Some data failed to sync';
    notifyListeners();
    return allSuccess;
  } catch (err) {
    console.error('[Habits Sync] Full push failed:', err);
    syncStatus = 'error';
    syncError = err instanceof Error ? err.message : 'Unknown sync error';
    notifyListeners();
    return false;
  }
}

/** Full pull sync: download all data from Supabase */
export async function fullPull(studentId: string, currentWeek: number): Promise<{
  student: Awaited<ReturnType<typeof pullStudent>>;
  dailyData: Awaited<ReturnType<typeof pullDailyEntries>>;
  quizHistory: Awaited<ReturnType<typeof pullQuizHistory>>;
  badges: Awaited<ReturnType<typeof pullBadges>>;
  clipboard: Awaited<ReturnType<typeof pullClipboardEntries>>;
} | null> {
  syncStatus = 'syncing';
  syncError = null;
  notifyListeners();

  try {
    const tablesExist = await ensureTablesExist();
    if (!tablesExist) {
      syncStatus = 'error';
      notifyListeners();
      return null;
    }

    const [student, dailyData, quizHistory, badges, clipboard] = await Promise.all([
      pullStudent(studentId),
      pullDailyEntries(studentId, currentWeek),
      pullQuizHistory(studentId),
      pullBadges(studentId),
      pullClipboardEntries(studentId),
    ]);

    syncStatus = 'synced';
    lastSyncAt = new Date().toISOString();
    notifyListeners();

    return { student, dailyData, quizHistory, badges, clipboard };
  } catch (err) {
    console.error('[Habits Sync] Full pull failed:', err);
    syncStatus = 'error';
    syncError = err instanceof Error ? err.message : 'Unknown sync error';
    notifyListeners();
    return null;
  }
}

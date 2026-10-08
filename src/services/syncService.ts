import { collection, doc, onSnapshot, type QuerySnapshot, type DocumentSnapshot } from 'firebase/firestore';
import { fbDb, isFirebaseConfigured } from './firebase';
import {
  isTombstoned,
  loadTombstones,
  replaceTombstones,
  setSessionUid,
  uploadDocs,
  uploadMissing,
} from './cloudStore';
import { SYNCED_SETTINGS, pickSyncedSettings, useStore } from '../store/useStore';
import { ChatMessage, Expense } from '../types';

type StoreState = ReturnType<typeof useStore.getState>;

let unsubs: Array<() => void> = [];
let activeUid: string | null = null;

const warn = (e: unknown) => console.warn('[sync]', e);

const byNewest = (a: Expense, b: Expense) => Number(b.id) - Number(a.id);
const chatTime = (id: string) => {
  const n = parseInt(id, 10);
  return Number.isNaN(n) ? 0 : n;
};
const byOldest = (a: ChatMessage, b: ChatMessage) => chatTime(a.id) - chatTime(b.id);

function purgeLocal() {
  useStore.setState(s => ({
    expenses: s.expenses.filter(e => !isTombstoned(e.id)),
    chat: s.chat.filter(m => !isTombstoned(m.id)),
  }));
}

export function stopSync(): void {
  unsubs.forEach(u => {
    try {
      u();
    } catch {}
  });
  unsubs = [];
  activeUid = null;
  setSessionUid(null);
}

export async function startSync(uid: string): Promise<void> {
  if (!isFirebaseConfigured || activeUid === uid) return;
  stopSync();
  activeUid = uid;
  setSessionUid(uid);

  try {
    await loadTombstones(uid);
  } catch (e) {
    warn(e);
  }
  if (activeUid !== uid) return;
  purgeLocal();

  try {
    const s = useStore.getState();
    await uploadMissing({ expenses: s.expenses, chat: s.chat, settings: pickSyncedSettings(s) });
  } catch (e) {
    warn(e);
  }
  if (activeUid !== uid) return;

  const db = fbDb();
  unsubs = [
    onSnapshot(
      collection(db, 'users', uid, 'expenses'),
      snap => onExpenses(snap, uid),
      warn,
    ),
    onSnapshot(collection(db, 'users', uid, 'chat'), snap => onChat(snap, uid), warn),
    onSnapshot(doc(db, 'users', uid, 'meta', 'settings'), snap => onSettings(snap), warn),
    onSnapshot(collection(db, 'users', uid, 'tombstones'), snap => onTombstones(snap), warn),
  ];
}

function onExpenses(snap: QuerySnapshot, uid: string) {
  if (activeUid !== uid) return;
  const remote = snap.docs.map(d => d.data() as Expense);
  const remoteIds = new Set(remote.map(e => e.id));
  const unsynced = useStore
    .getState()
    .expenses.filter(e => !remoteIds.has(e.id) && !isTombstoned(e.id));
  if (unsynced.length) uploadDocs('expenses', unsynced).catch(warn);
  useStore.setState({ expenses: [...remote, ...unsynced].sort(byNewest) });
}

function onChat(snap: QuerySnapshot, uid: string) {
  if (activeUid !== uid) return;
  const remote = snap.docs.map(d => d.data() as ChatMessage);
  const remoteIds = new Set(remote.map(m => m.id));
  const unsynced = useStore
    .getState()
    .chat.filter(m => !remoteIds.has(m.id) && !isTombstoned(m.id));
  if (unsynced.length) uploadDocs('chat', unsynced).catch(warn);
  useStore.setState({ chat: [...remote, ...unsynced].sort(byOldest) });
}

function onSettings(snap: DocumentSnapshot) {
  if (!snap.exists()) return;
  const data = snap.data();
  const patch: Partial<StoreState> = {};
  for (const k of SYNCED_SETTINGS) if (k in data) (patch as Record<string, unknown>)[k] = data[k];
  if (Object.keys(patch).length) useStore.setState(patch);
}

function onTombstones(snap: QuerySnapshot) {
  replaceTombstones(snap.docs.map(d => d.id));
  purgeLocal();
}

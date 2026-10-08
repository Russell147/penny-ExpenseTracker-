import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { fbDb } from './firebase';
import { ChatMessage, Expense } from '../types';

let sessionUid: string | null = null;
let tombstones = new Set<string>();

export function setSessionUid(uid: string | null): void {
  sessionUid = uid;
  if (!uid) tombstones = new Set();
}

export function replaceTombstones(ids: string[]): void {
  tombstones = new Set(ids);
}

export function isTombstoned(id: string): boolean {
  return tombstones.has(id);
}

const userCol = (name: string) => {
  if (!sessionUid) throw new Error('No active session');
  return collection(fbDb(), 'users', sessionUid, name);
};
const userDoc = (...path: string[]) => {
  if (!sessionUid) throw new Error('No active session');
  return doc(fbDb(), 'users', sessionUid, ...path);
};

const warn = (e: unknown) => console.warn('[cloudStore]', e);

const CHUNK = 400;

async function writeInBatches(
  ops: Array<(batch: ReturnType<typeof writeBatch>) => void>,
): Promise<void> {
  for (let i = 0; i < ops.length; i += CHUNK) {
    const batch = writeBatch(fbDb());
    ops.slice(i, i + CHUNK).forEach(op => op(batch));
    await batch.commit();
  }
}

export async function loadTombstones(uid: string): Promise<void> {
  const snap = await getDocs(collection(fbDb(), 'users', uid, 'tombstones'));
  tombstones = new Set(snap.docs.map(d => d.id));
}

export function mirrorExpense(e: Expense): void {
  if (!sessionUid) return;
  setDoc(userDoc('expenses', e.id), e).catch(warn);
}

export function mirrorRemoveExpense(id: string): void {
  if (!sessionUid) return;
  deleteDoc(userDoc('expenses', id)).catch(warn);
  setDoc(userDoc('tombstones', id), { deletedAt: Date.now() })
    .then(() => tombstones.add(id))
    .catch(warn);
}

export function mirrorChat(m: ChatMessage): void {
  if (!sessionUid) return;
  setDoc(userDoc('chat', m.id), { ...m }).catch(warn);
}

export function mirrorSettings(p: Record<string, unknown>): void {
  if (!sessionUid || !Object.keys(p).length) return;
  setDoc(userDoc('meta', 'settings'), p, { merge: true }).catch(warn);
}

export async function mirrorReset(expenseIds: string[], chatIds: string[]): Promise<void> {
  if (!sessionUid) return;
  const ids = [...expenseIds, ...chatIds];
  try {
    const expSnap = await getDocs(userCol('expenses'));
    const chatSnap = await getDocs(userCol('chat'));
    const allIds = new Set([
      ...ids,
      ...expSnap.docs.map(d => d.id),
      ...chatSnap.docs.map(d => d.id),
    ]);
    const ops: Array<(b: ReturnType<typeof writeBatch>) => void> = [];
    expSnap.docs.forEach(d => ops.push(b => b.delete(d.ref)));
    chatSnap.docs.forEach(d => ops.push(b => b.delete(d.ref)));
    allIds.forEach(id => ops.push(b => b.set(userDoc('tombstones', id), { deletedAt: Date.now() })));
    await writeInBatches(ops);
    allIds.forEach(id => tombstones.add(id));
  } catch (e) {
    warn(e);
  }
  mirrorSettings({
    catBudgets: {},
    notifications: true,
    budgetAlerts: true,
    biometricLock: false,
    quickAdd: true,
  });
}

export async function uploadDocs(
  name: 'expenses' | 'chat',
  items: Array<Expense | ChatMessage>,
): Promise<void> {
  if (!sessionUid || !items.length) return;
  await writeInBatches(items.map(item => b => b.set(userDoc(name, item.id), item as DocumentDataLike)));
}

export async function uploadMissing(data: {
  expenses: Expense[];
  chat: ChatMessage[];
  settings: Record<string, unknown>;
}): Promise<void> {
  if (!sessionUid) return;
  const expSnap = await getDocs(userCol('expenses'));
  const haveExpenses = new Set(expSnap.docs.map(d => d.id));
  const missingExpenses = data.expenses.filter(e => !haveExpenses.has(e.id) && !tombstones.has(e.id));

  const chatSnap = await getDocs(userCol('chat'));
  const haveChat = new Set(chatSnap.docs.map(d => d.id));
  const missingChat = data.chat.filter(m => !haveChat.has(m.id) && !tombstones.has(m.id));

  const settingsRef = userDoc('meta', 'settings');
  const settingsSnap = await getDoc(settingsRef);
  const writeSettings = !settingsSnap.exists() && Object.keys(data.settings).length > 0;

  const ops: Array<(b: ReturnType<typeof writeBatch>) => void> = [];
  missingExpenses.forEach(e => ops.push(b => b.set(userDoc('expenses', e.id), e as DocumentDataLike)));
  missingChat.forEach(m => ops.push(b => b.set(userDoc('chat', m.id), m as DocumentDataLike)));
  if (writeSettings) ops.push(b => b.set(settingsRef, data.settings));
  await writeInBatches(ops);
}

type DocumentDataLike = { [key: string]: unknown };

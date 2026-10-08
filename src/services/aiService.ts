import { httpsCallable } from 'firebase/functions';
import { Expense } from '../types';
import { thisMonth, total, byCategory } from '../utils/helpers';
import { fbFunctions, isFirebaseConfigured } from './firebase';

export type AIResult = { reply:string; expense?:{amount:number;categoryId:string;note:string;date:string}|null };

// The app computes all totals; the AI only explains them. Only a summary is sent,
// through the Firebase callable function so the Anthropic key stays server-side.
export async function askAI(question:string, expenses:Expense[], budget:number, currency:string): Promise<AIResult> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured');
  const m = thisMonth(expenses);
  const summary = { currency, monthlyBudget:budget, monthTotal:total(m), byCategory:byCategory(m), recent:expenses.slice(0,10).map(e=>({a:e.amount,c:e.categoryId,n:e.note,d:e.date})), today:new Date().toISOString().slice(0,10) };
  const fn = httpsCallable<{question:string;summary:unknown}, AIResult>(fbFunctions(), 'chat');
  const r = await fn({ question, summary });
  return r.data;
}

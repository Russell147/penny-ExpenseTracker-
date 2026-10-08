import { create } from 'zustand';
// The ESM middleware leaves import.meta.env in Metro's classic web bundle.
const { persist, createJSONStorage } = require('zustand/middleware') as typeof import('zustand/middleware');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, ChatMessage } from '../types';
import { mirrorChat, mirrorExpense, mirrorRemoveExpense, mirrorReset, mirrorSettings } from '../services/cloudStore';

export const SYNCED_SETTINGS = [
  'budget', 'catBudgets', 'currency', 'dark', 'onboarded',
  'notifications', 'budgetAlerts', 'biometricLock', 'quickAdd',
] as const;

export function pickSyncedSettings(s: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of SYNCED_SETTINGS) if (k in s) out[k] = s[k];
  return out;
}

type S = { expenses:Expense[]; budget:number; catBudgets:Record<string,number>; currency:string; dark:boolean; onboarded:boolean; notifications:boolean; budgetAlerts:boolean; biometricLock:boolean; quickAdd:boolean; chat:ChatMessage[];
 add:(e:Omit<Expense,'id'>)=>void; remove:(id:string)=>void; set:(p:Partial<S>)=>void; pushChat:(m:ChatMessage)=>void; reset:()=>void; clearSynced:()=>void };
export const useStore = create<S>()(persist((set,get)=>({
 expenses:[], budget:1000, catBudgets:{}, currency:'$', dark:false, onboarded:false, notifications:true, budgetAlerts:true, biometricLock:false, quickAdd:true, chat:[],
 add:e=>{ const exp = {...e,id:Date.now().toString()}; set(s=>({expenses:[exp,...s.expenses]})); mirrorExpense(exp); },
 remove:id=>{ set(s=>({expenses:s.expenses.filter(e=>e.id!==id)})); mirrorRemoveExpense(id); },
 set:p=>{ set(p); const patch = pickSyncedSettings(p as Record<string, unknown>); if(Object.keys(patch).length) mirrorSettings(patch); },
 pushChat:m=>{ set(s=>({chat:[...s.chat,m]})); mirrorChat(m); },
 reset:()=>{ const { expenses, chat } = get(); set({expenses:[],chat:[],catBudgets:{},notifications:true,budgetAlerts:true,biometricLock:false,quickAdd:true}); mirrorReset(expenses.map(e=>e.id), chat.map(m=>m.id)); },
 clearSynced:()=>set({expenses:[],chat:[],budget:1000,catBudgets:{}}),
}),{name:'pinnywise',storage:createJSONStorage(()=>AsyncStorage)}));

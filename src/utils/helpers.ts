import { Expense } from '../types';
export const fmt = (n:number, c='$') => `${c}${n.toFixed(2)}`;
export const thisMonth = (xs:Expense[]) => xs.filter(e => e.date.slice(0,7) === new Date().toISOString().slice(0,7));
export const total = (xs:Expense[]) => xs.reduce((s,e)=>s+e.amount,0);
export const byCategory = (xs:Expense[]) => xs.reduce<Record<string,number>>((m,e)=>{m[e.categoryId]=(m[e.categoryId]||0)+e.amount;return m;},{});

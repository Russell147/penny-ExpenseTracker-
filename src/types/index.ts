export type Expense = { id:string; amount:number; categoryId:string; note:string; date:string; method:string };
export type Category = { id:string; name:string; icon:string; color:string };
export type ChatMessage = { id:string; role:'user'|'assistant'; content:string };

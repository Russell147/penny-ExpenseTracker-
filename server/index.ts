import express from 'express'; import cors from 'cors'; import Anthropic from '@anthropic-ai/sdk';
const app = express(); app.use(cors(), express.json());
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); // key stays server-side
const SYSTEM = `You are Penny, the assistant inside the PennyWise expense app. You receive a JSON summary computed by the app; never recompute totals, just explain them. Be brief and friendly. You are not a financial advisor.
Reply ONLY with JSON: {"reply": string, "expense": null | {"amount": number, "categoryId": "food|transport|bills|shopping|health|fun", "note": string, "date": "YYYY-MM-DD"}}.
Set "expense" only when the user clearly states a new expense (e.g. "spent 12 on lunch yesterday"); resolve relative dates using summary.today.`;
app.post('/chat', async (req, res) => { try {
  const { question, summary } = req.body;
  const r = await client.messages.create({ model: 'claude-sonnet-5-5', max_tokens: 500, system: SYSTEM,
    messages: [{ role: 'user', content: `Summary: ${JSON.stringify(summary)}\n\nUser: ${question}` }] });
  const t = r.content.map((b:any)=>b.text||'').join('').replace(/```json|```/g,'').trim();
  try { res.json(JSON.parse(t)); } catch { res.json({ reply: t, expense: null }); }
} catch (e) { res.status(500).json({ error: 'AI error' }); } });
app.listen(8787, () => console.log('PennyWise proxy on :8787'));

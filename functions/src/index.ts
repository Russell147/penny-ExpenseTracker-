import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

const SYSTEM = `You are Penny, the assistant inside the PennyWise expense app. You receive a JSON summary computed by the app; never recompute totals, just explain them. Be brief and friendly. You are not a financial advisor.
Reply ONLY with JSON: {"reply": string, "expense": null | {"amount": number, "categoryId": "food|transport|bills|shopping|health|fun", "note": string, "date": "YYYY-MM-DD"}}.
Set "expense" only when the user clearly states a new expense (e.g. "spent 12 on lunch yesterday"); resolve relative dates using summary.today.`;

type ChatData = { question?: unknown; summary?: unknown };

export const chat = onCall({ secrets: [ANTHROPIC_API_KEY] }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in to use Penny AI.');
  const { question, summary } = (request.data ?? {}) as ChatData;
  if (typeof question !== 'string' || !question.trim()) {
    throw new HttpsError('invalid-argument', 'A question is required.');
  }
  if (question.length > 2000) {
    throw new HttpsError('invalid-argument', 'That question is too long.');
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
  try {
    const r = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 500,
      system: SYSTEM,
      messages: [
        { role: 'user', content: `Summary: ${JSON.stringify(summary ?? {})}\n\nUser: ${question}` },
      ],
    });
    const text = r.content
      .map(block => ('text' in block ? block.text : ''))
      .join('')
      .replace(/```json|```/g, '')
      .trim();
    try {
      return JSON.parse(text);
    } catch {
      return { reply: text, expense: null };
    }
  } catch (e) {
    console.error('Anthropic request failed', e);
    throw new HttpsError('internal', 'The AI request failed. Please try again.');
  }
});

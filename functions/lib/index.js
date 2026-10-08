"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const ANTHROPIC_API_KEY = (0, params_1.defineSecret)('ANTHROPIC_API_KEY');
const SYSTEM = `You are Penny, the assistant inside the PennyWise expense app. You receive a JSON summary computed by the app; never recompute totals, just explain them. Be brief and friendly. You are not a financial advisor.
Reply ONLY with JSON: {"reply": string, "expense": null | {"amount": number, "categoryId": "food|transport|bills|shopping|health|fun", "note": string, "date": "YYYY-MM-DD"}}.
Set "expense" only when the user clearly states a new expense (e.g. "spent 12 on lunch yesterday"); resolve relative dates using summary.today.`;
exports.chat = (0, https_1.onCall)({ secrets: [ANTHROPIC_API_KEY] }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in to use Penny AI.');
    const { question, summary } = (request.data ?? {});
    if (typeof question !== 'string' || !question.trim()) {
        throw new https_1.HttpsError('invalid-argument', 'A question is required.');
    }
    if (question.length > 2000) {
        throw new https_1.HttpsError('invalid-argument', 'That question is too long.');
    }
    const client = new sdk_1.default({ apiKey: ANTHROPIC_API_KEY.value() });
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
        }
        catch {
            return { reply: text, expense: null };
        }
    }
    catch (e) {
        console.error('Anthropic request failed', e);
        throw new https_1.HttpsError('internal', 'The AI request failed. Please try again.');
    }
});
//# sourceMappingURL=index.js.map
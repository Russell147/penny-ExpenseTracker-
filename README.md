# PennyWise

Expo expense tracker with a Firebase backend:

- **Auth** — email/password accounts + anonymous guest mode (Firebase Auth)
- **Data** — expenses, budgets, chat and settings sync across devices (Cloud Firestore)
- **Penny AI** — callable Cloud Function proxying Anthropic, so the API key stays server-side

Until a Firebase config is added, the app runs in local-only mode (device storage).

## 1. Install & run (local-only mode)

```
npm install
npx expo start
```

## 2. Create the free Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** (e.g. `pennywise`). Analytics is optional.
2. In the project: **Add app** → **Web** (`</>`) → register it (e.g. `pennywise-web`). Decline hosting options.
3. Copy the shown `firebaseConfig` values (`apiKey`, `authDomain`, `projectId`, …).
4. Paste them into `app.json` → `extra.firebase`, replacing the `REPLACE_…` / `YOUR_…` placeholders.
5. **Build → Authentication → Get started → Sign-in method** → enable **Email/Password** and **Anonymous**.
6. **Build → Firestore Database → Create database** → start in production mode → pick the region closest to you.
7. Copy your **project ID** (shown at the top of the console) into `.firebaserc` (`default`).

## 3. Deploy security rules + the AI function

```
npm i -g firebase-tools
firebase login
cd functions && npm install && cd ..
firebase deploy --only firestore:rules,functions
```

Store your Anthropic key as a secret (never put it in the app):

```
firebase functions:secrets:set ANTHROPIC_API_KEY
```

Paste your `sk-ant-…` key when prompted. If the deploy asks you to redeploy afterwards, run the deploy command again.

## 4. Run for real

```
npx expo start
```

- Sign in / create an account from the sign-in screen, or **Continue as guest** (anonymous account).
- Settings → **Account** shows your email and the sign-out button.
- Data lives in Firestore under `users/<uid>/…` with security rules that only let the owner read it; the device keeps a local cache so the app also works offline.

## Notes

- The old Express proxy in `server/` is no longer used — delete it once the Cloud Function is deployed.
- `extra.aiProxyUrl` was removed from app.json; the app now calls the `chat` Cloud Function.

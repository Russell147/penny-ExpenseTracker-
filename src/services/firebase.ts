import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

type FirebaseWebConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const cfg = (Constants.expoConfig?.extra as { firebase?: FirebaseWebConfig } | undefined)?.firebase;

const placeholder = (v?: string) => !v || v.startsWith('REPLACE') || v.startsWith('YOUR_');

export const isFirebaseConfigured = Boolean(
  cfg && !placeholder(cfg.apiKey) && !placeholder(cfg.projectId) && !placeholder(cfg.appId),
);

export const NOT_CONFIGURED_MESSAGE =
  'Firebase is not configured yet. Paste your firebaseConfig into app.json under extra.firebase.';

let app: FirebaseApp | undefined;
let auth: FirebaseAuth.Auth | undefined;
let db: Firestore | undefined;
let fns: Functions | undefined;

function fbApp(): FirebaseApp {
  if (!isFirebaseConfigured || !cfg) throw new Error(NOT_CONFIGURED_MESSAGE);
  if (!app) app = getApps().length ? getApps()[0] : initializeApp(cfg as FirebaseWebConfig & { apiKey: string; projectId: string; appId: string });
  return app;
}

export function fbAuth(): FirebaseAuth.Auth {
  if (!auth) {
    const a = fbApp();
    // React Native: persist the session in AsyncStorage. This helper only exists
    // in the React Native bundle of firebase/auth (not in the web types), so it
    // is accessed dynamically and falls back to getAuth() on web.
    const getRN = (FirebaseAuth as unknown as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence;
    }).getReactNativePersistence;
    try {
      auth = getRN
        ? FirebaseAuth.initializeAuth(a, { persistence: getRN(AsyncStorage) })
        : FirebaseAuth.getAuth(a);
    } catch {
      auth = FirebaseAuth.getAuth(a);
    }
  }
  return auth;
}

export function fbDb(): Firestore {
  if (!db) db = getFirestore(fbApp());
  return db;
}

export function fbFunctions(): Functions {
  if (!fns) fns = getFunctions(fbApp());
  return fns;
}

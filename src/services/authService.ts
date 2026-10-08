import * as FirebaseAuth from 'firebase/auth';
import { fbAuth, isFirebaseConfigured } from './firebase';

export type AuthUser = { uid: string; email: string | null; isAnonymous: boolean };

export function watchAuth(cb: (user: AuthUser | null) => void): () => void {
  if (!isFirebaseConfigured) {
    cb(null);
    return () => {};
  }
  return FirebaseAuth.onAuthStateChanged(fbAuth(), u =>
    cb(u ? { uid: u.uid, email: u.email, isAnonymous: u.isAnonymous } : null),
  );
}

export async function continueAsGuest(): Promise<void> {
  if (!isFirebaseConfigured) return;
  await FirebaseAuth.signInAnonymously(fbAuth());
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await FirebaseAuth.signInWithEmailAndPassword(fbAuth(), email.trim(), password);
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const a = fbAuth();
  const current = a.currentUser;
  if (current?.isAnonymous) {
    const credential = FirebaseAuth.EmailAuthProvider.credential(email.trim(), password);
    try {
      await FirebaseAuth.linkWithCredential(current, credential);
      return;
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code !== 'auth/credential-already-in-use' && code !== 'auth/email-already-in-use') throw e;
      // The email already belongs to an account: sign in instead; local data
      // (including guest data) is merged into that account by the sync layer.
      await FirebaseAuth.signInWithEmailAndPassword(a, email.trim(), password);
      return;
    }
  }
  await FirebaseAuth.createUserWithEmailAndPassword(a, email.trim(), password);
}

export async function resetPassword(email: string): Promise<void> {
  await FirebaseAuth.sendPasswordResetEmail(fbAuth(), email.trim());
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured) return;
  await FirebaseAuth.signOut(fbAuth());
}

export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string; message?: string })?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/email-already-in-use':
      return 'That email already has an account. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return (e as { message?: string })?.message || 'Something went wrong.';
  }
}

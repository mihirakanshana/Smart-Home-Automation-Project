import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInAnonymously,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './config';
import { UserProfile } from '../types';

export function mapFirebaseUser(user: FirebaseUser | null): UserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Smart Home Admin'),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
}

export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const user = mapFirebaseUser(cred.user);
  if (!user) throw new Error('User not found after sign in');
  return user;
}

export async function signupUser(email: string, pass: string, displayName?: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  const user = mapFirebaseUser(cred.user);
  if (!user) throw new Error('User creation failed');
  return user;
}

export async function signInGuest(): Promise<UserProfile> {
  const cred = await signInAnonymously(auth);
  const user = mapFirebaseUser(cred.user);
  if (!user) throw new Error('Guest sign in failed');
  return user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function subscribeAuthState(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(mapFirebaseUser(firebaseUser));
  });
}

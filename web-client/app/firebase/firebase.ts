// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider,onAuthStateChanged, User } from "firebase/auth";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM0zHg4IMbvnu46vyNvV0aGsL_vDacBiQ",
  authDomain: "video-processing-9d8ff.firebaseapp.com",
  projectId: "video-processing-9d8ff",
  appId: "1:505715932424:web:08f29a8ac283431e5380bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export const functions = getFunctions();

/**
 * Signs the user in with a Google account.
 *
 * @returns A promise that resolves with the result of the sign-in operation.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out of the current session.
 *
 * @returns A promise that resolves with the result of the sign-out operation.
 */
export function signOutWithGoogle() {
    return auth.signOut();
}

/**
 * Registers a callback to be called when the user's authentication state changes.
 *
 * @param callback A function that will be called with the user's current
 * authentication state as its first argument. If the user is signed in, the
 * first argument will contain the user's information. If the user is signed out,
 * the first argument will be null.
 *
 * @returns An unsubscribe function that can be called to stop listening to
 * changes in the user's authentication state.
 */
export function onAuthStateChangedCallback(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
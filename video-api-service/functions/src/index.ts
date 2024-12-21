/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import { onAuthUserCreated } from "firebase-functions/v2";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

const storage = new Storage();

const rawVideoBucketName = "ak-yt-raw-video-bucket";


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

const firestore = getFirestore();

const videoCollectionId = "videos";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string
}

export const createUser = functions.auth.user().onCreate(async (user) => {
  try {
    const userInfo = {
      uid: user.uid,
      email: user.email || null,
      photoUrl: user.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`User created: ${JSON.stringify(userInfo)}`);
    return null;
  } catch (error) {
    logger.error("Error creating user:", error);
    throw error;
  }
});

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  // Check if the user is authentication
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const auth = request.auth;
  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);
  // Generate a unique filename for upload
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  // Get a v4 signed URL for uploading file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return {url, fileName};
});

export const getVideos = onCall({maxInstances: 1}, async () => {
  const querySnapshot =
    await firestore.collection(videoCollectionId).limit(10).get();
  return querySnapshot.docs.map((doc) => doc.data());
});

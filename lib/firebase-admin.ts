import * as admin from "firebase-admin";

// Server-side Firebase Admin SDK — used for verifying OTP tokens sent from the client.
// Swap to Twilio Verify by replacing verifyOtpToken() only.
// Required env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL

function getFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    }),
  });
}

export async function verifyOtpToken(idToken: string): Promise<{
  phone: string;
  uid: string;
}> {
  const app = getFirebaseAdmin();
  const decoded = await app.auth().verifyIdToken(idToken);

  if (!decoded.phone_number) {
    throw new Error("Token does not contain a verified phone number");
  }

  return { phone: decoded.phone_number, uid: decoded.uid };
}

export async function sendFcmNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const app = getFirebaseAdmin();
  await app.messaging().send({
    token: fcmToken,
    notification: { title, body },
    data,
  });
}

export async function sendFcmToMultiple(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (fcmTokens.length === 0) return;
  const app = getFirebaseAdmin();
  await app.messaging().sendEachForMulticast({
    tokens: fcmTokens,
    notification: { title, body },
    data,
  });
}

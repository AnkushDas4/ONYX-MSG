const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("🔥 Firebase Admin Initialized.");
  } catch (error) {
    console.error("❌ Firebase Init Error:", error);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { fcmToken, encrypted_content, sender_id, timestamp } = req.body;

    if (!fcmToken || !encrypted_content) {
      return res.status(400).json({ error: 'Missing fcmToken or encrypted_content' });
    }

    const message = {
      token: fcmToken,
      data: {
        type: 'CHAT_MSG',
        encrypted_content: encrypted_content,
        sender_id: sender_id || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
      },
      android: { priority: 'high' },
      apns: {
        payload: { aps: { 'content-available': 1 } },
        headers: { 'apns-priority': '5' },
      },
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, messageId: response });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

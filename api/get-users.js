import admin from 'firebase-admin';

// 1. Init Admin SDK (Same as before)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error.stack);
  }
}

const db = admin.firestore();

// ⚠️ YOUR EMAIL HERE (The only person allowed in)
const ADMIN_EMAILS = ['udas44647@gmail.com']; 

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // 1. Verify the ID Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization Header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    // 2. Check the VIP List
    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'ACCESS DENIED: You are not an Admin.' });
    }

    // 3. Fetch Data (Server-to-Server)
    // We query the 'user_logs' collection we created earlier
    const snapshot = await db.collection('user_logs').orderBy('lastSeen', 'desc').get();
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Timestamp to readable string for the frontend
      lastSeen: doc.data().lastSeen?.toDate().toISOString() 
    }));

    return res.status(200).json({ success: true, users });

  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  }

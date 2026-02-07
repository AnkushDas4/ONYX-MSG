import admin from 'firebase-admin';

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
const ADMIN_EMAILS = ['udas44647@gmail.com']; 

export default async function handler(req, res) {
  // --- CORS HEADERS (THE FIX) ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow ALL domains (including localhost)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle the "Preflight" check (Browser asks permission first)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No Token' });

    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);

    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ error: 'Not an Admin' });
    }

    const snapshot = await db.collection('user_logs').orderBy('lastSeen', 'desc').get();
    const users = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(), 
      lastSeen: doc.data().lastSeen?.toDate().toISOString() 
    }));

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

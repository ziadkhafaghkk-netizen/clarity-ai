import pdf from 'pdf-parse';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: process.env.FIREBASE_AUTH,
  projectId: process.env.FIREBASE_PROJECT,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const { file, userId, name } = req.body;
    const buffer = Buffer.from(file, 'base64');

    let text = '';
    if (name.endsWith('.pdf')) {
      const data = await pdf(buffer);
      text = data.text;
    } else {
      text = buffer.toString('utf-8');
    }

    const chunks = text.match(/.{1,1200}/g) || [];

    const docId = `${userId}_${Date.now()}`;
    await setDoc(doc(db, "documents", docId), {
      userId,
      name,
      chunks,
      createdAt: Date.now()
    });

    res.json({ docId, chunks: chunks.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
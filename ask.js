import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: process.env.FIREBASE_AUTH,
  projectId: process.env.FIREBASE_PROJECT,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const { question, docId, userId, type, mode, answer } = req.body;

    const docSnap = await getDoc(doc(db, "documents", docId));
    if (!docSnap.exists() || docSnap.data().userId!== userId) {
      return res.status(403).json({ error: "ممنوع" });
    }

    const chunks = docSnap.data().chunks;
    const relevant = chunks
   .filter(c => question.split(' ').some(word => word.length > 3 && c.toLowerCase().includes(word.toLowerCase())))
   .slice(0, 8)
   .join('\n\n---\n\n');

    let prompt = '';

    if (mode === 'explain') {
      prompt = `
اشرح الحل ده بالتفصيل باستخدام النص المصدر فقط.
اشرح ليه دي الاجابة الصحيحة وايه الخطوات اللي وصلت لها.
ممنوع استخدام معلومات من بره النص.

السؤال: ${question}
الحل: ${answer}
النص المصدر:
${relevant}
`;
    }
    else if (type === 'exam') {
      prompt = `
أنت مدرس بتحل امتحانات. استخدم النص المرفق فقط.
لو السؤال مقالي: حل مع الخطوات والشرح المختصر.
لو السؤال اختياري: اكتب الاجابة الصحيحة بس من غير شرح.
لو مش موجود في النص قول "مش موجود في المصدر".

النص المصدر:
${relevant}

الأسئلة:
${question}
`;
    }
    else if (type === 'quiz') {
      prompt = `من النص ده اعمل 5 اسئلة اختيار من متعدد مع الاجابة الصحيحة وتفسير قصير لكل سؤال. النص: ${relevant}`;
    }
    else {
      prompt = `جاوب على السؤال ده باستخدام النص فقط. مسموح تستنتج وتشرح من النص. لو ملوش علاقة بالنص قول "مش موجود في المصدر":\nالسؤال: ${question}\nالنص: ${relevant}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: mode === 'explain'? 0.6 : 0.3,
          maxOutputTokens: 2000
        }
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "حصل خطأ في المعالجة";
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
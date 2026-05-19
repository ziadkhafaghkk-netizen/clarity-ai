'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [examFile, setExamFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [examText, setExamText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExamUpload, setShowExamUpload] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', f);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setText(data.text);
    setLoading(false);
  };

  const handleExamFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setExamFile(f);
    const formData = new FormData();
    formData.append('file', f);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setExamText(data.text);
  };

  const handleAction = async (action: 'summarize' | 'quiz' | 'solve') => {
    if (!text) return alert('ارفع الملف الأساسي الأول');
    if (action === 'solve' &&!examText) return alert('ارفع ملف الامتحان الأول');

    setLoading(true);
    setResult('');
    const res = await fetch('/api/clarity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, action, examText }),
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
    setShowExamUpload(false);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Clarity AI</h1>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
        <p className="mb-2">ارفع الملف الأساسي PDF</p>
        <input type="file" onChange={handleFileChange} accept=".pdf,.txt" className="mx-auto" />
        {file && <p className="mt-2 text-green-600">تم رفع: {file.name}</p>}
      </div>

      {text && (
        <div className="flex gap-3 justify-center flex-wrap mb-6">
          <button onClick={() => handleAction('summarize')} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            لخّص الملف
          </button>
          <button onClick={() => handleAction('quiz')} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            اعمل كويز
          </button>
          <button onClick={() => setShowExamUpload(true)} disabled={loading} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            حل الامتحان
          </button>
        </div>
      )}

      {showExamUpload && (
        <div className="mt-4 p-4 border-2 border-dashed border-purple-400 rounded-lg mb-6">
          <p className="mb-2">ارفع ملف الامتحان:</p>
          <input type="file" onChange={handleExamFileChange} accept=".pdf,.txt" className="mx-auto block" />
          {examFile && <p className="mt-2 text-green-600">تم رفع: {examFile.name}</p>}
          <button onClick={() => handleAction('solve')} disabled={!examText || loading} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50">
            حل الامتحان
          </button>
        </div>
      )}

      {loading && <p className="text-center">شغال... استنى شوية</p>}
      {result && <div className="mt-6 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">{result}</div>}
    </main>
  );
}

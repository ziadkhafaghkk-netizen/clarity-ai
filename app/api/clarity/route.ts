import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text, action, examText } = await req.json();

    let prompt = '';
    if (action === 'summarize') {
      prompt = `لخّص النص التالي في نقاط مهمة زي سلايدات الباور بوينت. كل نقطة سطر واحد وواضح. استخدم العربية:\n\n${text}`;
    } else if (action === 'quiz') {
      prompt = `اعمل 5 أسئلة اختيار من متعدد على النقاط المهمة في النص ده. كل سؤال 4 اختيارات وعلّم الإجابة الصح في الآخر. استخدم العربية:\n\n${text}`;
    } else if (action === 'solve') {
      prompt = `ده ملف المصدر:\n${text}\n\nوده ملف الامتحان:\n${examText}\n\nحل أسئلة الامتحان باستخدام المعلومات من ملف المصدر بس. اشرح بإيجاز. استخدم العربية.`;
    } else {
      return NextResponse.json({ error: 'action غير صحيحة' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    
    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

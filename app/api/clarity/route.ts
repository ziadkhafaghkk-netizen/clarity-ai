import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (err) {
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

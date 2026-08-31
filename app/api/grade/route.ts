import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { fileDataUrl, maxScore, rules } = await req.json();

    if (!fileDataUrl || !maxScore || !rules) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract mime type and base64 string from data URL
    const match = fileDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    const [, mimeType, base64Data] = match;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        `MAX SCORE: ${maxScore}\n\nTEACHER RULES:\n${rules}`,
      ],
      config: {
        systemInstruction: `You are an uncompromising, precise academic grader. Transcribe and evaluate the student's work shown in the image against the provided constraints.

1. READ WORK: Carefully analyze the student's work or code line by line.
2. STRICT COMPLIANCE: Adhere strictly to the TEACHER RULES. Treat negative conditions (e.g., "no working shown = 0 points", "missing units = deduct 2 points") as absolute logical overrides. If a student gets the correct answer but breaks an absolute rule, enforce the rule penalization without exception.
3. MATHEMATICAL VALIDITY: Sum the points earned in the breakdown to equal total_score. total_score must not exceed MAX SCORE.

Return ONLY a valid JSON object matching this schema:
{
  "total_score": number,
  "max_score": number,
  "breakdown": [
    {
      "item": "string summary",
      "points_earned": number,
      "points_possible": number,
      "reason": "explanation referencing student work"
    }
  ],
  "feedback": "concise summary"
}`,
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return NextResponse.json(parsedData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
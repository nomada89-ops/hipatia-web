import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { drive_v3, google } from 'googleapis';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const CREDENTIALS_PATH = path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || 'google-service-account.json');
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Initialize Vertex AI
const auth = new GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive'],
});

// --- HELPER FUNCTIONS ---

// 1. Helper to convert File/Blob to Base64 for Vertex AI
async function fileToGenerativePart(fileBuffer: Buffer, mimeType: string) {
    return {
        inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType,
        },
    };
}

// 2. The Judge: Gemini Vertex AI
async function callJudge(fileBuffer: Buffer, mimeType: string, rubric: string, criteria: string) {
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION, googleAuthOptions: { keyFile: CREDENTIALS_PATH } });
    // Use a vision-capable model
    const model = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-pro-preview-0409', // Or latest available stable vision model
        safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }]
    });

    const prompt = `
    You are an expert academic examiner. Your task is to grade this exam paper objectively.
    
    RUBRIC/MODEL ANSWERS:
    ${rubric || "No specific rubric provided. Use general academic standards."}
    
    SPECIFIC CRITERIA:
    ${criteria || "None."}
    
    INSTRUCTIONS:
    1. Read the provided exam image/PDF carefully.
    2. Identify questions and answers.
    3. Evaluate each answer against the rubric.
    4. Provide a grade from 0 to 10.
    5. Provide specific feedback on errors and correctly answered questions.
    
    OUTPUT FORMAT (JSON ONLY):
    {
        "grade": number,
        "summary": "string",
        "details": [
            { "question": "string", "score": number, "feedback": "string" }
        ]
    }
    `;

    const imagePart = await fileToGenerativePart(fileBuffer, mimeType);

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
    });

    const response = await result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Gemini returned no content");

    // Clean markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
}

// 3. The Auditor: Deepseek
async function callAuditor(judgeOutput: any, rubric: string) {
    // Deepseek is text-based context auditor here
    const prompt = `
    You are an impartial Auditor AI. You are reviewing a grade given by another examiner (The Judge).
    
    THE JUDGE'S EVALUATION:
    ${JSON.stringify(judgeOutput)}

    ORIGINAL RUBRIC:
    ${rubric || "Standard academic criteria"}

    TASK:
    1. Check for inconsistencies in the Judge's logic (e.g., harsh penalties, calculation errors).
    2. Confirm if the grade seems fair based on the feedback provided.
    3. Generate a "Final Verdict".

    OUTPUT FORMAT (JSON ONLY):
    {
        "is_fair": boolean,
        "audit_comment": "string",
        "final_grade": number (can be same as Judge's or corrected)
    }
    `;

    try {
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat", // Check exact model name in docs, usually deepseek-chat or deepseek-coder
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
    } catch (e) {
        console.error("Deepseek Audit Failed, using Judge's grade:", e);
        return { is_fair: true, audit_comment: "Audit skipped (API Error)", final_grade: judgeOutput.grade };
    }
}

// 4. Persistence: Google Drive
async function uploadToDrive(htmlReport: string, studentId: string) {
    const drive = google.drive({ version: 'v3', auth });

    // 1. Find or Create Folder for Student
    let folderId;
    const q = `mimeType='application/vnd.google-apps.folder' and name='${studentId}' and trashed=false`;
    const folderRes = await drive.files.list({ q });

    if (folderRes.data.files && folderRes.data.files.length > 0) {
        folderId = folderRes.data.files[0].id;
    } else {
        const createRes = await drive.files.create({
            requestBody: {
                name: studentId,
                mimeType: 'application/vnd.google-apps.folder'
            }
        });
        folderId = createRes.data.id;
    }

    // 2. Upload File
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Exam_Correction_${timestamp}.html`;

    const fileRes = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [folderId!],
        },
        media: {
            mimeType: 'text/html',
            body: htmlReport,
        },
        fields: 'id, webViewLink',
    });

    return fileRes.data.webViewLink;
}

// --- MAIN ROUTE HANDLER ---
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const studentId = formData.get('studentId') as string;
        const rubric = formData.get('rubric') as string;
        const criteria = formData.get('criteria') as string;

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // STEPS
        // 1. Judge
        const judgeResult = await callJudge(buffer, file.type, rubric, criteria);

        // 2. Auditor
        const auditResult = await callAuditor(judgeResult, rubric);

        // 3. Generate Report HTML
        const finalGrade = auditResult.final_grade;
        const html = `
        <html>
        <head>
            <style>
                body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: auto; }
                .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
                .grade { font-size: 4em; font-weight: bold; color: ${finalGrade >= 5 ? 'green' : 'red'}; }
                .section { margin-top: 30px; }
                .audit { background: #f0f9ff; padding: 15px; border-left: 5px solid #0070f3; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Exam Correction Report</h1>
                <p>Student ID: ${studentId}</p>
                <div class="grade">${finalGrade}/10</div>
            </div>
            
            <div class="section">
                <h2>Judge's Feedback (Gemini)</h2>
                <p>${judgeResult.summary}</p>
                <ul>
                    ${judgeResult.details.map((d: any) => `<li><b>${d.question}</b>: ${d.feedback} (Score: ${d.score})</li>`).join('')}
                </ul>
            </div>

            <div class="audit">
                <h3>🛡️ AI Audit (Deepseek)</h3>
                <p><b>Is Fair?</b> ${auditResult.is_fair ? 'Yes' : 'No'}</p>
                <p>${auditResult.audit_comment}</p>
            </div>
        </body>
        </html>
        `;

        // 4. Persistence
        const driveLink = await uploadToDrive(html, studentId);

        return NextResponse.json({
            success: true,
            grade: finalGrade,
            feedback: judgeResult.summary + "\n\nAUDIT: " + auditResult.audit_comment,
            driveLink
        });

    } catch (error: any) {
        console.error('Grading Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Define the interface based on the user's specific headers
interface Incident {
    student_id: string;
    teacher_code: string;
    Fecha_Falta: string;
    Tipo_Falta: string;
    fecha_incidente: string;
    hora_incidente: string; // [NEW] Added field
    contacto_familia: string;
    gravedad: string;
    articulo_aplicado: string;
    student_course: string;
}

export async function GET() {
    try {
        const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;
        const sheetId = process.env.SHEET_ID;

        if (!serviceAccountEmail || !privateKey || !sheetId) {
            console.error('Backend: Missing environment variables');
            return NextResponse.json(
                { error: 'Missing environment variables for Google Sheets connection.' },
                { status: 500 }
            );
        }

        // Prepare key
        const keyToUse = privateKey.replace(/\\n/g, '\n');

        const jwt = new JWT({
            email: serviceAccountEmail,
            key: keyToUse,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ],
        });

        const doc = new GoogleSpreadsheet(sheetId, jwt);

        // Load document properties and worksheets
        console.log('Backend: Loading doc info...');
        await doc.loadInfo();
        console.log('Backend: Doc info loaded. Title:', doc.title);

        // [NEW] Get specific sheet by title
        const sheetTitle = 'Registro de sanciones';
        const sheet = doc.sheetsByTitle[sheetTitle];

        if (!sheet) {
            console.error(`Backend: Sheet '${sheetTitle}' not found.`);
            return NextResponse.json(
                { error: `Sheet '${sheetTitle}' not found in the spreadsheet.` },
                { status: 404 }
            );
        }
        console.log(`Backend: Sheet '${sheetTitle}' loaded.`);

        // load header rows
        console.log('Backend: Loading header row...');
        await sheet.loadHeaderRow();

        // Get all rows
        console.log('Backend: Getting rows...');
        const rows = await sheet.getRows();
        console.log(`Backend: Rows fetched. Count: ${rows.length}`);

        // Transform rows to Incident objects
        const incidents: Incident[] = rows.map((row) => {
            // Helper to safely get cell value
            const getVal = (key: string) => {
                const val = row.get(key);
                return val ? String(val).trim() : '';
            };

            return {
                student_id: getVal('student_id'),
                teacher_code: getVal('teacher_code'),
                Fecha_Falta: getVal('Fecha_Falta'),
                Tipo_Falta: getVal('Tipo_Falta'),
                fecha_incidente: getVal('fecha_incidente'),
                hora_incidente: getVal('hora_incidente'), // [NEW] Map new field
                contacto_familia: getVal('contacto_familia'),
                gravedad: getVal('gravedad'),
                articulo_aplicado: getVal('articulo_aplicado'),
                student_course: getVal('student_course'),
            };
        })
            // Filter out completely empty rows or rows without critical data
            .filter(inc => inc.student_id !== '');

        console.log(`Backend: Incidents parsed. Count: ${incidents.length}`);

        return NextResponse.json(incidents);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching data from Google Sheets:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (error instanceof Error && (error as any).response) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.error('Error response data:', (error as any).response.data);
        }
        return NextResponse.json(
            { error: 'Failed to fetch data', details: errorMessage },
            { status: 500 }
        );
    }
}

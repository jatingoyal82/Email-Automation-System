import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface EmailRecord {
    Email: string;
    Subject: string;
    Body: string;
    Status: string;
    'Sent at': string;
    Error: string;
}

function parseCSV(csvText: string): EmailRecord[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers:', headers); // Debug log

    const data: EmailRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index].trim().replace(/"/g, '');
            });
            data.push(row as EmailRecord);
        }
    }

    // Debug: Log first email to see structure
    if (data.length > 0) {
        console.log('Sample email data:', JSON.stringify(data[0], null, 2));
    }

    return data;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

export async function GET() {
    try {
        const sheetId = process.env.NEXT_PUBLIC_SHEET_ID;

        if (!sheetId) {
            return NextResponse.json(
                { error: 'SHEET_ID not configured' },
                { status: 500 }
            );
        }

        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

        const response = await fetch(csvUrl, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sheet: ${response.status}`);
        }

        const csvText = await response.text();
        console.log('CSV Text (first 500 chars):', csvText.substring(0, 500)); // Debug log

        const emails = parseCSV(csvText);

        // Calculate statistics
        const stats = {
            total: emails.length,
            sent: emails.filter(e => e.Status === 'Sent').length,
            failed: emails.filter(e => e.Status === 'Failed').length,
            pending: emails.filter(e => e.Status === 'Pending').length,
        };

        return NextResponse.json({
            emails,
            stats,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching email data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch email data' },
            { status: 500 }
        );
    }
}

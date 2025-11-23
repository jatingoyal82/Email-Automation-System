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
        // Get the Sheet ID from environment variable
        const sheetId = process.env.NEXT_PUBLIC_SHEET_ID;

        // Detailed logging for debugging
        console.log('Environment check:', {
            hasSheetId: !!sheetId,
            sheetIdLength: sheetId?.length,
            sheetIdPreview: sheetId ? `${sheetId.substring(0, 10)}...` : 'undefined'
        });

        if (!sheetId) {
            console.error('SHEET_ID not configured in environment variables');
            return NextResponse.json(
                {
                    error: 'SHEET_ID not configured',
                    details: 'Environment variable NEXT_PUBLIC_SHEET_ID is missing'
                },
                { status: 500 }
            );
        }

        // Validate Sheet ID format (should be alphanumeric with hyphens/underscores)
        const sheetIdRegex = /^[a-zA-Z0-9_-]+$/;
        if (!sheetIdRegex.test(sheetId)) {
            console.error('Invalid Sheet ID format:', sheetId);
            return NextResponse.json(
                {
                    error: 'Invalid SHEET_ID format',
                    details: 'Sheet ID contains invalid characters'
                },
                { status: 500 }
            );
        }

        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        console.log('Fetching from URL:', csvUrl);

        // Fetch with timeout and better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response;
        try {
            response = await fetch(csvUrl, {
                cache: 'no-store',
                signal: controller.signal,
            });
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            console.error('Fetch error:', fetchError);

            if (fetchError.name === 'AbortError') {
                return NextResponse.json(
                    {
                        error: 'Request timeout',
                        details: 'Google Sheets request took too long to respond'
                    },
                    { status: 504 }
                );
            }

            return NextResponse.json(
                {
                    error: 'Network error',
                    details: `Failed to connect to Google Sheets: ${fetchError.message}`
                },
                { status: 502 }
            );
        }

        clearTimeout(timeoutId);

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Sheets error response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText.substring(0, 500)
            });

            if (response.status === 404) {
                return NextResponse.json(
                    {
                        error: 'Sheet not found',
                        details: 'The Google Sheet does not exist or is not accessible. Please check the Sheet ID and ensure the sheet is set to "Anyone with the link can view".'
                    },
                    { status: 404 }
                );
            }

            if (response.status === 403) {
                return NextResponse.json(
                    {
                        error: 'Access denied',
                        details: 'The Google Sheet is not publicly accessible. Please set sharing to "Anyone with the link can view".'
                    },
                    { status: 403 }
                );
            }

            return NextResponse.json(
                {
                    error: 'Failed to fetch sheet',
                    details: `Google Sheets returned status ${response.status}: ${response.statusText}`
                },
                { status: response.status }
            );
        }

        const csvText = await response.text();
        console.log('CSV received, length:', csvText.length);
        console.log('CSV preview (first 200 chars):', csvText.substring(0, 200));

        if (!csvText || csvText.trim().length === 0) {
            console.error('Empty CSV response');
            return NextResponse.json(
                {
                    error: 'Empty sheet',
                    details: 'The Google Sheet appears to be empty'
                },
                { status: 400 }
            );
        }

        const emails = parseCSV(csvText);
        console.log('Parsed emails count:', emails.length);

        // Calculate statistics
        const stats = {
            total: emails.length,
            sent: emails.filter(e => e.Status === 'Sent').length,
            failed: emails.filter(e => e.Status === 'Failed').length,
            pending: emails.filter(e => e.Status === 'Pending').length,
        };

        console.log('Stats:', stats);

        return NextResponse.json({
            emails,
            stats,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Unexpected error in API route:', error);
        console.error('Error stack:', error.stack);

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message || 'An unexpected error occurred',
                type: error.name || 'Unknown'
            },
            { status: 500 }
        );
    }
}

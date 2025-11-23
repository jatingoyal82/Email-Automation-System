import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';

/**
 * Reads pending emails from a publicly shared Google Sheet
 * @param {string} sheetId - The Google Sheet ID
 * @returns {Promise<Array>} Array of email objects with status "Pending"
 */
export async function readPendingEmails(sheetId) {
  try {
    // Construct CSV export URL for public sheet
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    console.log(`[Sheet Reader] Fetching data from sheet: ${sheetId}`);
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
    }
    
    const csvData = await response.text();
    
    // Parse CSV data
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`[Sheet Reader] Found ${records.length} total rows`);
    
    // Filter for pending emails and add row number
    const pendingEmails = records
      .map((record, index) => ({
        ...record,
        rowNumber: index + 2 // +2 because: +1 for 0-index, +1 for header row
      }))
      .filter(record => record.Status === 'Pending');
    
    console.log(`[Sheet Reader] Found ${pendingEmails.length} pending emails`);
    
    return pendingEmails;
  } catch (error) {
    console.error('[Sheet Reader] Error reading sheet:', error.message);
    throw error;
  }
}

/**
 * Google Apps Script Webhook for Email Automation System
 * 
 * Deploy this script as a web app:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Click Deploy > New deployment
 * 5. Select type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy and copy the web app URL
 * 
 * Expected Sheet Structure:
 * Column A: Email
 * Column B: Subject
 * Column C: Body
 * Column D: Status
 * Column E: Sent At
 * Column F: Error
 */

function doPost(e) {
  try {
    // Parse incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.rowNumber || !data.status) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing required fields: rowNumber and status'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Update the row
    const row = data.rowNumber;
    
    // Column D: Status
    sheet.getRange(row, 4).setValue(data.status);
    
    // Column E: Sent At (if provided)
    if (data.sentAt) {
      sheet.getRange(row, 5).setValue(data.sentAt);
    }
    
    // Column F: Error (if provided)
    if (data.error) {
      sheet.getRange(row, 6).setValue(data.error);
    } else {
      // Clear error if status is Sent
      if (data.status === 'Sent') {
        sheet.getRange(row, 6).setValue('');
      }
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: `Row ${row} updated successfully`,
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testWebhook() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        rowNumber: 2,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        error: ''
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}

import fetch from 'node-fetch';

/**
 * Update a row in the Google Sheet via Apps Script webhook
 * @param {string} webhookUrl - The Apps Script webhook URL
 * @param {number} rowNumber - Row number to update (1-indexed)
 * @param {Object} updateData - Data to update (status, sentAt, error)
 * @returns {Promise<Object>} Response from webhook
 */
export async function updateSheetRow(webhookUrl, rowNumber, updateData) {
    try {
        console.log(`[Sheet Updater] Updating row ${rowNumber} with status: ${updateData.status}`);

        const payload = {
            rowNumber,
            status: updateData.status,
            sentAt: updateData.sentAt || '',
            error: updateData.error || ''
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || result.status === 'error') {
            throw new Error(result.message || 'Failed to update sheet');
        }

        console.log(`[Sheet Updater] ✓ Row ${rowNumber} updated successfully`);

        return result;
    } catch (error) {
        console.error(`[Sheet Updater] ✗ Failed to update row ${rowNumber}:`, error.message);
        throw error;
    }
}

/**
 * Update sheet with success status
 * @param {string} webhookUrl - The Apps Script webhook URL
 * @param {number} rowNumber - Row number to update
 * @param {string} timestamp - Timestamp when email was sent
 */
export async function markAsSent(webhookUrl, rowNumber, timestamp) {
    return updateSheetRow(webhookUrl, rowNumber, {
        status: 'Sent',
        sentAt: timestamp,
        error: ''
    });
}

/**
 * Update sheet with failure status
 * @param {string} webhookUrl - The Apps Script webhook URL
 * @param {number} rowNumber - Row number to update
 * @param {string} errorMessage - Error message
 */
export async function markAsFailed(webhookUrl, rowNumber, errorMessage) {
    return updateSheetRow(webhookUrl, rowNumber, {
        status: 'Failed',
        sentAt: '',
        error: errorMessage
    });
}

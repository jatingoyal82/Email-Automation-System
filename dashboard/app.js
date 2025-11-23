// Configuration - UPDATE THIS WITH YOUR GOOGLE SHEET ID
const SHEET_ID = '1FRe_VR-oYKAM-iRmjWn200sn4kGd-cNSMGqmAjSDp9A';

// CSV export URL for public Google Sheet
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// Auto-refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;

// State
let emailData = [];
let autoRefreshTimer = null;

/**
 * Parse CSV data into array of objects
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index].trim().replace(/"/g, '');
            });
            data.push(row);
        }
    }

    return data;
}

/**
 * Parse a single CSV line (handles commas in quotes)
 */
function parseCSVLine(line) {
    const result = [];
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

/**
 * Fetch email data from Google Sheet
 */
async function fetchEmailData() {
    try {
        // Check if SHEET_ID is configured
        if (SHEET_ID === 'your_google_sheet_id_here') {
            showConfigNotice();
            return;
        }

        const response = await fetch(CSV_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch sheet: ${response.status}`);
        }

        const csvText = await response.text();
        emailData = parseCSV(csvText);

        updateDashboard();
        updateLastUpdatedTime();
        hideConfigNotice();
    } catch (error) {
        console.error('Error fetching email data:', error);
        showError('Failed to load email data. Please check your Sheet ID and ensure the sheet is publicly accessible.');
    }
}

/**
 * Calculate statistics from email data
 */
function calculateStats() {
    const total = emailData.length;
    const sent = emailData.filter(e => e.Status === 'Sent').length;
    const failed = emailData.filter(e => e.Status === 'Failed').length;
    const pending = emailData.filter(e => e.Status === 'Pending').length;

    return { total, sent, failed, pending };
}

/**
 * Update dashboard with latest data
 */
function updateDashboard() {
    const stats = calculateStats();

    // Update statistics cards with animation
    updateStatCard('totalCount', stats.total);
    updateStatCard('sentCount', stats.sent);
    updateStatCard('failedCount', stats.failed);
    updateStatCard('pendingCount', stats.pending);

    // Update emails table
    updateEmailsTable();
}

/**
 * Update a stat card with animation
 */
function updateStatCard(elementId, newValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;

    if (currentValue !== newValue) {
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Update emails table
 */
function updateEmailsTable() {
    const tbody = document.getElementById('emailsTableBody');

    if (emailData.length === 0) {
        tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="5">
          <div class="empty-state-icon">📭</div>
          <div>No emails found. Add emails to your Google Sheet to get started.</div>
        </td>
      </tr>
    `;
        return;
    }

    // Sort by most recent first (assuming rows are added chronologically)
    const sortedData = [...emailData].reverse();

    tbody.innerHTML = sortedData.map(email => {
        const statusClass = email.Status.toLowerCase();
        const statusIcon = getStatusIcon(email.Status);

        return `
      <tr>
        <td>${escapeHtml(email.Email || '')}</td>
        <td>${escapeHtml(email.Subject || '')}</td>
        <td>
          <span class="status-badge ${statusClass}">
            <span class="status-icon">${statusIcon}</span>
            ${email.Status}
          </span>
        </td>
        <td>${formatDateTime(email['Sent At'])}</td>
        <td>
          ${email.Error ? `<span class="error-text" title="${escapeHtml(email.Error)}">${escapeHtml(email.Error)}</span>` : '—'}
        </td>
      </tr>
    `;
    }).join('');
}

/**
 * Get status icon based on status
 */
function getStatusIcon(status) {
    switch (status.toLowerCase()) {
        case 'sent':
            return '✓';
        case 'failed':
            return '✗';
        case 'pending':
            return '⏳';
        default:
            return '•';
    }
}

/**
 * Format date/time string
 */
function formatDateTime(dateString) {
    if (!dateString) return '—';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        // Show relative time for recent emails
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

        // Otherwise show formatted date
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update last updated time
 */
function updateLastUpdatedTime() {
    const element = document.getElementById('lastUpdated');
    const now = new Date();
    element.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Show configuration notice
 */
function showConfigNotice() {
    document.getElementById('configNotice').style.display = 'block';
}

/**
 * Hide configuration notice
 */
function hideConfigNotice() {
    document.getElementById('configNotice').style.display = 'none';
}

/**
 * Show error message
 */
function showError(message) {
    const tbody = document.getElementById('emailsTableBody');
    tbody.innerHTML = `
    <tr class="empty-state">
      <td colspan="5">
        <div class="empty-state-icon">⚠️</div>
        <div style="color: var(--accent-failed);">${escapeHtml(message)}</div>
      </td>
    </tr>
  `;
}

/**
 * Start auto-refresh
 */
function startAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }

    autoRefreshTimer = setInterval(() => {
        fetchEmailData();
    }, REFRESH_INTERVAL);
}

/**
 * Manual refresh handler
 */
function handleRefresh() {
    const btn = document.getElementById('refreshBtn');
    const icon = btn.querySelector('.refresh-icon');

    // Animate refresh button
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        icon.style.transform = 'rotate(0deg)';
    }, 600);

    fetchEmailData();
}

/**
 * Initialize dashboard
 */
function init() {
    // Set up refresh button
    document.getElementById('refreshBtn').addEventListener('click', handleRefresh);

    // Initial data fetch
    fetchEmailData();

    // Start auto-refresh
    startAutoRefresh();

    console.log('📊 Email Automation Dashboard initialized');
    console.log(`🔄 Auto-refresh enabled (every ${REFRESH_INTERVAL / 1000}s)`);
}

// Start dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

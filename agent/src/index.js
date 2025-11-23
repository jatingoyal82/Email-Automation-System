import dotenv from 'dotenv';
import { readPendingEmails } from './sheetReader.js';
import { initializeTransporter, sendEmail, verifyConnection } from './emailSender.js';
import { markAsSent, markAsFailed } from './sheetUpdater.js';

// Load environment variables
dotenv.config();

// Configuration
const config = {
    sheetId: process.env.SHEET_ID,
    webhookUrl: process.env.WEBHOOK_URL,
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME || 'Email Automation System'
    },
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000
};

// Validate configuration
function validateConfig() {
    const required = ['sheetId', 'webhookUrl', 'smtp.host', 'smtp.port', 'smtp.user', 'smtp.pass', 'from.email'];
    const missing = [];

    if (!config.sheetId) missing.push('SHEET_ID');
    if (!config.webhookUrl) missing.push('WEBHOOK_URL');
    if (!config.smtp.host) missing.push('SMTP_HOST');
    if (!config.smtp.port) missing.push('SMTP_PORT');
    if (!config.smtp.user) missing.push('SMTP_USER');
    if (!config.smtp.pass) missing.push('SMTP_PASS');
    if (!config.from.email) missing.push('FROM_EMAIL');

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('Please copy .env.example to .env and fill in the values');
        process.exit(1);
    }
}

// Process pending emails
async function processEmails() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log(`[Agent] Checking for pending emails... (${new Date().toLocaleString()})`);
        console.log('='.repeat(60));

        // Read pending emails from sheet
        const pendingEmails = await readPendingEmails(config.sheetId);

        if (pendingEmails.length === 0) {
            console.log('[Agent] No pending emails found');
            return;
        }

        console.log(`[Agent] Processing ${pendingEmails.length} pending email(s)...\n`);

        // Process each email
        for (const email of pendingEmails) {
            console.log(`[Agent] Processing email ${email.rowNumber - 1}/${pendingEmails.length}`);
            console.log(`  To: ${email.Email}`);
            console.log(`  Subject: ${email.Subject}`);

            // Send email
            const result = await sendEmail(email, config.from);

            // Update sheet based on result
            try {
                if (result.success) {
                    await markAsSent(config.webhookUrl, email.rowNumber, result.timestamp);
                    console.log(`  ✓ Status updated to "Sent"\n`);
                } else {
                    await markAsFailed(config.webhookUrl, email.rowNumber, result.error);
                    console.log(`  ✗ Status updated to "Failed"\n`);
                }
            } catch (updateError) {
                console.error(`  ⚠ Warning: Email sent but failed to update sheet:`, updateError.message);
            }

            // Small delay between emails to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('[Agent] Batch processing complete');
    } catch (error) {
        console.error('[Agent] Error processing emails:', error.message);
    }
}

// Main function
async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        Email Automation Agent - Starting Up               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Validate configuration
    validateConfig();
    console.log('✓ Configuration validated');

    // Initialize email transporter
    initializeTransporter(config.smtp);

    // Verify SMTP connection
    const isConnected = await verifyConnection();
    if (!isConnected) {
        console.error('❌ Failed to connect to SMTP server. Please check your credentials.');
        process.exit(1);
    }
    console.log('✓ SMTP connection verified\n');

    console.log(`📧 Agent will check for new emails every ${config.checkInterval / 1000} seconds`);
    console.log(`📊 Dashboard: Open dashboard/index.html in your browser`);
    console.log(`📝 Google Sheet: https://docs.google.com/spreadsheets/d/${config.sheetId}\n`);
    console.log('Press Ctrl+C to stop the agent\n');

    // Process emails immediately on startup
    await processEmails();

    // Set up interval to check for new emails
    setInterval(processEmails, config.checkInterval);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n[Agent] Shutting down gracefully...');
    console.log('[Agent] Goodbye! 👋\n');
    process.exit(0);
});

// Start the agent
main()
  .then(() => process.exit(0))
  .catch(err => {
      console.error("Fatal error:", err);
      process.exit(1);
});


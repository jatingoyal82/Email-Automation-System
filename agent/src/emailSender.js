import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Initialize email transporter with SMTP configuration
 * @param {Object} config - SMTP configuration
 */
export function initializeTransporter(config) {
    transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465, // true for 465, false for other ports
        auth: {
            user: config.user,
            pass: config.pass
        }
    });

    console.log('[Email Sender] Transporter initialized');
}

/**
 * Send an email
 * @param {Object} emailData - Email data (to, subject, body)
 * @param {Object} fromConfig - From email configuration
 * @returns {Promise<Object>} Result object with success status
 */
export async function sendEmail(emailData, fromConfig) {
    if (!transporter) {
        throw new Error('Email transporter not initialized');
    }

    try {
        const { Email: to, Subject: subject, Body: body } = emailData;

        console.log(`[Email Sender] Sending email to: ${to}`);

        const mailOptions = {
            from: `"${fromConfig.name}" <${fromConfig.email}>`,
            to: to,
            subject: subject,
            text: body,
            html: body.replace(/\n/g, '<br>') // Simple HTML conversion
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`[Email Sender] ✓ Email sent successfully to ${to} (Message ID: ${info.messageId})`);

        return {
            success: true,
            messageId: info.messageId,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`[Email Sender] ✗ Failed to send email:`, error.message);

        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Verify SMTP connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function verifyConnection() {
    if (!transporter) {
        throw new Error('Email transporter not initialized');
    }

    try {
        await transporter.verify();
        console.log('[Email Sender] SMTP connection verified');
        return true;
    } catch (error) {
        console.error('[Email Sender] SMTP connection failed:', error.message);
        return false;
    }
}

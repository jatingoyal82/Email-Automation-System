# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet
3. Add these column headers in row 1:
   ```
   Email | Subject | Body | Status | Sent At | Error
   ```
4. Add a test email:
   | Email | Subject | Body | Status | Sent At | Error |
   |-------|---------|------|--------|---------|-------|
   | your-email@example.com | Test Email | Hello! This is a test. | Pending | | |

5. **Share the sheet**:
   - Click "Share" button
   - Change to "Anyone with the link"
   - Set permission to "Viewer"
   - Click "Copy link"

6. **Get the Sheet ID**:
   - From the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Copy the `SHEET_ID` part

### Step 2: Deploy Apps Script Webhook

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy the entire contents of `google-apps-script/webhook.gs`
4. Paste it into the Apps Script editor
5. Click **Deploy** → **New deployment**
6. Click the gear icon ⚙️ next to "Select type"
7. Choose **Web app**
8. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone
9. Click **Deploy**
10. **Copy the Web app URL** (you'll need this)
11. Click **Done**

### Step 3: Configure the Agent

1. Open a terminal and navigate to the agent folder:
   ```bash
   cd email-automation-system/agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your favorite text editor:
   ```env
   # Paste your Google Sheet ID
   SHEET_ID=paste_your_sheet_id_here
   
   # Paste your Apps Script webhook URL
   WEBHOOK_URL=paste_your_webhook_url_here
   
   # Gmail SMTP settings (or use another provider)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Agent settings
   CHECK_INTERVAL=60000
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=Email Automation System
   ```

   **For Gmail App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Create a new app password
   - Copy and paste it as `SMTP_PASS`

### Step 4: Configure the Dashboard

1. Open `dashboard/app.js` in a text editor
2. Find this line (line 2):
   ```javascript
   const SHEET_ID = 'your_google_sheet_id_here';
   ```
3. Replace with your actual Sheet ID:
   ```javascript
   const SHEET_ID = 'paste_your_sheet_id_here';
   ```
4. Save the file

### Step 5: Run the System

1. **Start the agent**:
   ```bash
   cd agent
   npm start
   ```

   You should see:
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║        Email Automation Agent - Starting Up               ║
   ╚════════════════════════════════════════════════════════════╝

   ✓ Configuration validated
   ✓ SMTP connection verified

   📧 Agent will check for new emails every 60 seconds
   ```

2. **Open the dashboard**:
   - Navigate to `email-automation-system/dashboard/`
   - Double-click `index.html` to open in your browser
   - You should see your email statistics!

## ✅ Verification

- [ ] Agent is running without errors
- [ ] Dashboard shows statistics (even if all zeros)
- [ ] Test email was sent to your inbox
- [ ] Google Sheet status updated to "Sent"
- [ ] Dashboard shows the sent email

## 🎉 You're Done!

Now you can:
- Add more emails to your Google Sheet with Status = "Pending"
- Watch the agent process them automatically
- Monitor progress in the dashboard
- Check your inbox for the emails

## 🆘 Troubleshooting

**Agent won't start?**
- Check your `.env` file has all values filled in
- Verify SMTP credentials are correct
- For Gmail, make sure you're using an App Password

**Dashboard shows "Configuration Required"?**
- Update `SHEET_ID` in `dashboard/app.js`

**Emails not sending?**
- Check agent console for error messages
- Verify SMTP settings
- Check spam folder

**Sheet not updating?**
- Verify webhook URL is correct
- Check Apps Script deployment settings
- Make sure "Who has access" is set to "Anyone"

## 📚 More Help

See the full [README.md](../README.md) for:
- Detailed troubleshooting
- Advanced configuration
- Security considerations
- Production deployment tips

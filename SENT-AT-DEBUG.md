# Sent At Column - Troubleshooting Guide

## Issue

The "Sent At" column in the dashboard shows "—" (em dash) instead of timestamps.

## Root Cause

The Google Sheet's "Sent At" column is empty because:
1. The Node.js agent hasn't run yet to send emails, OR
2. The agent hasn't updated the sheet via the webhook

## Solution

### Step 1: Verify Google Sheet Structure

Your sheet should have these columns (in order):
```
Email | Subject | Body | Status | Sent At | Error
```

### Step 2: Run the Agent

The agent will populate the "Sent At" column when it sends emails:

```bash
cd agent
npm start
```

### Step 3: Check Debug Logs

The dashboard API now includes debug logging. Check your terminal where `npm run dev` is running to see:
- CSV Headers being parsed
- Sample email data structure
- Raw CSV content

### Step 4: Manual Test

To manually test, add a timestamp to the "Sent At" column in your Google Sheet:
```
2025-11-23T10:30:00Z
```

The dashboard will then display it as:
- "Just now" (if less than 1 minute ago)
- "5m ago" (if 5 minutes ago)
- "2h ago" (if 2 hours ago)
- "Nov 23, 10:30 AM" (if older)

## Expected Workflow

1. **Add email to sheet** with Status = "Pending"
2. **Agent runs** every 60 seconds (or configured interval)
3. **Agent sends email** via SMTP
4. **Agent calls webhook** to update sheet
5. **Webhook updates** "Sent At" column with timestamp
6. **Dashboard refreshes** and shows the timestamp

## Debugging Commands

### Check if sheet is accessible:
```bash
curl "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv"
```

### Check API response:
```bash
curl http://localhost:3000/api/emails
```

### View terminal logs:
Look for these debug messages in your Next.js terminal:
- `CSV Headers: [...]`
- `Sample email data: {...}`
- `CSV Text (first 500 chars): ...`

## Quick Fix

If you want to see timestamps immediately without running the agent:

1. Open your Google Sheet
2. Find a row with Status = "Sent"
3. In the "Sent At" column for that row, enter:
   ```
   2025-11-23T14:00:00Z
   ```
4. Refresh the dashboard
5. You should now see "Xm ago" or a formatted date

## Common Issues

### Issue: Still showing "—"
**Cause**: Column name mismatch
**Fix**: Ensure the header is exactly "Sent At" (with space, capital S and A)

### Issue: Shows the raw timestamp
**Cause**: formatDateTime function not working
**Fix**: Check browser console for JavaScript errors

### Issue: Shows "Invalid Date"
**Cause**: Timestamp format is incorrect
**Fix**: Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

## Next Steps

1. ✅ Created HOST.md for deployment
2. ✅ Added debug logging to API route
3. ⏳ Run the agent to populate data
4. ⏳ Verify webhook is updating the sheet

Once the agent runs and sends an email, the "Sent At" column will automatically populate!

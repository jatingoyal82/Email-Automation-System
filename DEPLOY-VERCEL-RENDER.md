# Deploy to Vercel (Dashboard) + Render (Agent)

Complete guide to deploy your email automation system using **Vercel** for the dashboard and **Render** for the agent.

---

## 🚀 Part 1: Deploy Dashboard to Vercel

### Prerequisites
- GitHub account
- Vercel account (free) - [Sign up here](https://vercel.com/signup)

### Step 1: Push Code to GitHub

```bash
cd "d:/Task/Refresh Kids/project 8/email-automation-system"
git init
git add .
git commit -m "Initial commit - Email automation system"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/email-automation-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `dashboard-next`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   - **Name**: `NEXT_PUBLIC_SHEET_ID`
   - **Value**: `1FRe_VR-oYKAM-iRmjWn200sn4kGd-cNSMGqmAjSDp9A`

6. Click **"Deploy"**

7. Wait 2-3 minutes for deployment to complete

8. Your dashboard is now live at: `https://your-project-name.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to dashboard directory
cd dashboard-next

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - Project name? email-automation-dashboard
# - Directory? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

### Step 3: Verify Dashboard

1. Visit your Vercel URL
2. Check if statistics load
3. Verify email table displays
4. Test refresh button

---

## 🔧 Part 2: Deploy Agent to Render

### Prerequisites
- Render account (free) - [Sign up here](https://render.com/signup)
- Same GitHub repository from Part 1

### Step 1: Prepare Agent for Deployment

Create `render.yaml` in the root directory:

```yaml
services:
  - type: web
    name: email-automation-agent
    env: node
    region: oregon
    plan: free
    buildCommand: cd agent && npm install
    startCommand: cd agent && node src/index.js
    envVars:
      - key: SHEET_ID
        sync: false
      - key: WEBHOOK_URL
        sync: false
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        sync: false
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: FROM_EMAIL
        sync: false
      - key: FROM_NAME
        sync: false
      - key: CHECK_INTERVAL
        value: 60000
```

Commit and push:
```bash
git add render.yaml
git commit -m "Add Render configuration"
git push
```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `email-automation-agent`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `cd agent && npm install`
   - **Start Command**: `cd agent && node src/index.js`
   - **Instance Type**: Free

5. Add Environment Variables (click "Advanced"):
   ```
   SHEET_ID=1FRe_VR-oYKAM-iRmjWn200sn4kGd-cNSMGqmAjSDp9A
   WEBHOOK_URL=your_webhook_url_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=your_email@gmail.com
   FROM_NAME=Email Automation
   CHECK_INTERVAL=60000
   ```

6. Click **"Create Web Service"**

7. Wait 5-10 minutes for deployment

### Step 3: Verify Agent

1. Check Render logs for "Agent started successfully"
2. Add a test email to your Google Sheet with Status="Pending"
3. Wait 60 seconds
4. Check if email was sent
5. Verify Google Sheet was updated

---

## 🔒 Important: Get Your Webhook URL

Before deploying the agent, you need to deploy the Google Apps Script webhook:

### Deploy Webhook

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Paste the webhook code from `google-apps-script/webhook.gs`
4. Click **Deploy** → **New deployment**
5. Settings:
   - **Type**: Web app
   - **Execute as**: Me
   - **Who has access**: Anyone
6. Click **Deploy**
7. Copy the **Web app URL** (this is your WEBHOOK_URL)
8. Add this URL to Render environment variables

---

## 📊 Post-Deployment Checklist

### Dashboard (Vercel)
- [ ] Dashboard loads without errors
- [ ] Statistics display correctly
- [ ] Email table shows data
- [ ] Auto-refresh works (every 30s)
- [ ] Responsive on mobile

### Agent (Render)
- [ ] Agent starts without errors
- [ ] Connects to Google Sheet
- [ ] Sends test email successfully
- [ ] Updates sheet via webhook
- [ ] Runs continuously (check logs)

---

## 🌐 Your Live URLs

After deployment, you'll have:

- **Dashboard**: `https://your-project-name.vercel.app`
- **Agent**: `https://email-automation-agent.onrender.com` (runs in background)
- **Webhook**: `https://script.google.com/macros/s/YOUR_ID/exec`

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing)
- **Vercel**: Free (Hobby plan)
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS
- **Render**: Free
  - 750 hours/month
  - Sleeps after 15 min inactivity
  - Wakes on request
- **Total**: $0/month

### Paid (For Production)
- **Vercel Pro**: $20/month
  - More bandwidth
  - Better performance
  - Team features
- **Render Starter**: $7/month
  - Always-on service
  - No sleep
  - Better resources
- **Total**: $27/month

---

## 🔄 Auto-Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Automatic Deploy**:
   - Vercel: Deploys dashboard automatically
   - Render: Deploys agent automatically

3. **Check Status**:
   - Vercel: Check dashboard at vercel.com
   - Render: Check logs at render.com

---

## 🐛 Troubleshooting

### Dashboard not loading
- Check Vercel deployment logs
- Verify `NEXT_PUBLIC_SHEET_ID` is set
- Ensure Google Sheet is public

### Agent not sending emails
- Check Render logs for errors
- Verify all environment variables
- Test SMTP credentials locally first
- Check webhook URL is correct

### Render Free Tier Sleeping
The free tier sleeps after 15 minutes of inactivity. To keep it awake:

**Option 1**: Upgrade to Starter plan ($7/month)

**Option 2**: Use a cron job to ping it:
```bash
# Add to crontab (runs every 10 minutes)
*/10 * * * * curl https://email-automation-agent.onrender.com
```

**Option 3**: Use UptimeRobot (free) to ping every 5 minutes

---

## 📝 Environment Variables Reference

### Dashboard (.env.local)
```
NEXT_PUBLIC_SHEET_ID=your_sheet_id
```

### Agent (Render Environment)
```
SHEET_ID=your_sheet_id
WEBHOOK_URL=your_webhook_url
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=Email Automation
CHECK_INTERVAL=60000
```

---

## 🎉 Success!

Your email automation system is now live and accessible worldwide!

- **Dashboard**: Monitor emails in real-time
- **Agent**: Automatically sends emails 24/7
- **Webhook**: Updates Google Sheet automatically

Share your dashboard URL with anyone to showcase your project! 🚀

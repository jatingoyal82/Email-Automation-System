# Hosting Guide - Email Automation System

Complete guide to deploy your email automation system online so anyone can access it.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Dashboard) ⭐

**Best for**: Next.js dashboard deployment - Free, fast, and easy.

#### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to dashboard directory**:
   ```bash
   cd dashboard-next
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `email-automation-dashboard`
   - Directory? `./`
   - Override settings? **N**

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SHEET_ID
   ```
   Enter your Google Sheet ID when prompted.

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

6. **Your dashboard is now live!**
   - URL: `https://email-automation-dashboard.vercel.app`
   - Auto-deploys on git push

**Custom Domain** (Optional):
```bash
vercel domains add yourdomain.com
```

---

### Option 2: Netlify (Alternative for Dashboard)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   cd dashboard-next
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set environment variables** in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add `NEXT_PUBLIC_SHEET_ID`

---

### Option 3: Railway (For Node.js Agent) 🚂

**Best for**: Running the automation agent 24/7.

#### Steps:

1. **Create `railway.json`** in the `agent` directory:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "node src/index.js",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Sign up** at [railway.app](https://railway.app)

3. **Create new project** → Deploy from GitHub

4. **Connect your repository**

5. **Add environment variables**:
   - `SHEET_ID`
   - `WEBHOOK_URL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `FROM_EMAIL`
   - `FROM_NAME`
   - `CHECK_INTERVAL`

6. **Deploy** - Railway will auto-deploy on push

**Cost**: ~$5/month for always-on service

---

### Option 4: Render (Alternative for Agent)

1. **Sign up** at [render.com](https://render.com)

2. **Create new Web Service**

3. **Connect GitHub repository**

4. **Configure**:
   - **Build Command**: `cd agent && npm install`
   - **Start Command**: `cd agent && node src/index.js`
   - **Environment**: Node

5. **Add environment variables** (same as Railway)

6. **Deploy**

**Cost**: Free tier available (sleeps after inactivity)

---

### Option 5: Heroku (Full Stack)

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create apps**:
   ```bash
   # For dashboard
   heroku create email-automation-dashboard
   
   # For agent
   heroku create email-automation-agent
   ```

4. **Deploy dashboard**:
   ```bash
   cd dashboard-next
   git init
   heroku git:remote -a email-automation-dashboard
   git add .
   git commit -m "Deploy dashboard"
   git push heroku main
   ```

5. **Deploy agent**:
   ```bash
   cd ../agent
   git init
   heroku git:remote -a email-automation-agent
   git add .
   git commit -m "Deploy agent"
   git push heroku main
   ```

6. **Set environment variables**:
   ```bash
   heroku config:set SHEET_ID=your_sheet_id -a email-automation-agent
   # ... add all other env vars
   ```

---

## 📋 Pre-Deployment Checklist

### Dashboard
- [ ] Environment variable `NEXT_PUBLIC_SHEET_ID` is set
- [ ] Google Sheet is publicly accessible
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in production build

### Agent
- [ ] All environment variables are set
- [ ] SMTP credentials are valid
- [ ] Google Sheet webhook is deployed
- [ ] Webhook URL is accessible
- [ ] Test email sending locally first

---

## 🔒 Security Best Practices

### 1. Environment Variables
- **Never** commit `.env` files
- Use platform-specific env var management
- Rotate SMTP credentials regularly

### 2. Google Sheet
- Keep sheet ID in environment variables
- Don't expose sensitive data in the sheet
- Consider adding authentication to webhook

### 3. SMTP
- Use app-specific passwords (not main password)
- Enable 2FA on email account
- Monitor for suspicious activity

### 4. Webhook
- Add API key authentication
- Implement rate limiting
- Log all requests

---

## 🚀 Recommended Setup

### For Production:

1. **Dashboard**: Deploy to **Vercel**
   - Free tier is generous
   - Automatic HTTPS
   - Global CDN
   - Easy custom domains

2. **Agent**: Deploy to **Railway**
   - Always-on service
   - Easy environment management
   - Good logging
   - Affordable pricing

3. **Total Cost**: ~$5/month

---

## 📊 Monitoring & Logs

### Vercel Dashboard
- View deployment logs
- Monitor performance
- Check analytics

### Railway Dashboard
- View agent logs in real-time
- Monitor resource usage
- Set up alerts

### Google Sheets
- Check "Sent At" timestamps
- Monitor error column
- Track success rate

---

## 🔄 CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-dashboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd dashboard-next && npm install
      - run: cd dashboard-next && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🌍 Custom Domain Setup

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Update DNS records

### Railway
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS with CNAME

---

## 📝 Post-Deployment

### Test Everything:

1. **Dashboard**:
   - Visit your deployed URL
   - Check if statistics load
   - Verify email table displays correctly
   - Test auto-refresh

2. **Agent**:
   - Add a test email to Google Sheet
   - Wait for processing interval
   - Check if email is sent
   - Verify sheet is updated

3. **End-to-End**:
   - Add pending email
   - Watch agent process it
   - See dashboard update
   - Receive actual email

---

## 🐛 Troubleshooting

### Dashboard not loading data
- Check `NEXT_PUBLIC_SHEET_ID` is set correctly
- Verify Google Sheet is public
- Check browser console for errors

### Agent not sending emails
- Verify all environment variables
- Check SMTP credentials
- Review agent logs
- Test webhook URL manually

### Webhook not updating sheet
- Check webhook deployment
- Verify "Who has access" is set to "Anyone"
- Test with curl:
  ```bash
  curl -X POST your-webhook-url \
    -H "Content-Type: application/json" \
    -d '{"rowNumber":2,"status":"Sent","sentAt":"2025-11-23T10:00:00Z","error":""}'
  ```

---

## 💰 Cost Breakdown

### Free Tier Option:
- **Vercel**: Free (dashboard)
- **Render**: Free with sleep (agent)
- **Total**: $0/month (agent sleeps after inactivity)

### Recommended Paid:
- **Vercel**: Free (dashboard)
- **Railway**: $5/month (agent always-on)
- **Total**: $5/month

### Enterprise:
- **Vercel Pro**: $20/month
- **Railway Pro**: $20/month
- **SendGrid**: $15/month (better email deliverability)
- **Total**: $55/month

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🎉 Quick Start Commands

```bash
# Deploy dashboard to Vercel
cd dashboard-next
vercel --prod

# Deploy agent to Railway
# (Use Railway dashboard - easier than CLI)

# Check deployment status
vercel ls
```

---

**Your system is now accessible worldwide!** 🌍

Share your dashboard URL with anyone, and they can monitor your email automation in real-time.

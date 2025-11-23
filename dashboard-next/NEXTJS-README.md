# Next.js Dashboard - Quick Start

## 🚀 Running the Dashboard

The dashboard has been upgraded to **Next.js** for better performance and to fix CORS issues!

### Start the Dashboard

```bash
cd dashboard-next
npm run dev
```

The dashboard will be available at: **http://localhost:3000**

### What's New in Next.js Version

✅ **Fixed CORS Issue** - Server-side data fetching via API routes  
✅ **Better Performance** - React with automatic optimization  
✅ **Auto-refresh** - Updates every 30 seconds automatically  
✅ **Same Premium Design** - All the glassmorphism and animations you love  
✅ **TypeScript** - Better type safety and developer experience  

### Configuration

The Sheet ID is already configured in `.env.local`:
```
NEXT_PUBLIC_SHEET_ID=1FRe_VR-oYKAM-iRmjWn200sn4kGd-cNSMGqmAjSDp9A
```

To change it, edit `dashboard-next/.env.local`

### Features

- 📊 **Real-time Statistics**: Total, Sent, Failed, and Pending counts
- 📋 **Email Table**: Recent emails with status badges
- 🔄 **Auto-refresh**: Updates every 30 seconds
- ✨ **Premium Design**: Glassmorphism, gradients, smooth animations
- 📱 **Responsive**: Works on all devices

### Development

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

**Data not loading?**
- Check that the Sheet ID in `.env.local` is correct
- Verify the Google Sheet is shared publicly
- Check browser console for errors (F12)

## 📁 Project Structure

```
dashboard-next/
├── app/
│   ├── api/
│   │   └── emails/
│   │       └── route.ts       # API endpoint for fetching emails
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main dashboard page
├── .env.local                 # Environment variables
└── package.json
```

## 🎨 Why Next.js?

The original vanilla JS dashboard had a **CORS issue** - browsers block direct requests to Google Sheets CSV export URLs. 

Next.js solves this by:
1. Fetching data server-side in the API route (`/api/emails`)
2. The browser requests data from our own API (same origin)
3. No CORS errors! ✅

---

**Enjoy your working dashboard!** 🎉

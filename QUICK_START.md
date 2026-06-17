# Quick Start Guide

## Setup (Already Complete!)

Your Next.js Blueprint application is ready to run! Here's what was done:

### ✅ Project Structure Created
```
blueprint/
├── app/
│   ├── components/
│   │   ├── Blueprint.js      # Main React component (client-side)
│   │   └── data.js           # JIRA data and configuration
│   ├── globals.css           # All styles for the app
│   ├── layout.js             # Root layout with metadata
│   └── page.js               # Home page that renders Blueprint
├── package.json              # Dependencies & scripts
├── next.config.js            # Next.js configuration
└── .gitignore               # Git ignore rules
```

### ✅ Dependencies Installed
- Next.js 14.2.0
- React 18.3.0
- React DOM 18.3.0

### ✅ Build Verified
The production build completed successfully!

---

## Running the Application

### Development Mode (Recommended)

```bash
cd /Users/amitgupta1/Documents/repo/blueprint
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Mode

```bash
npm run build
npm start
```

---

## Using the Application

### 1. Knowledge Tab
- View live JIRA index (20 issues loaded)
- Filter by project: PHOEN, POSP, PBPAR, PD
- Ask questions about the codebase
- Click suggested chips for quick queries

### 2. Docs Tab
- Browse 2 documentation entries
- Search docs by keyword
- Click any doc to view full details

### 3. Drafts Tab
- View 2 requirement drafts from Slack
- Click "Start solutioning →" to begin

### 4. Solutioning Tab
- Unlocks after selecting a draft
- AI-powered Q&A to refine requirements
- Click "Close → BRD" when ready

### 5. BRD Tab
- View generated Business Requirement Document
- Click "Break into JIRA stories →"

### 6. JIRA Tab
- Review generated stories
- Click "Create in JIRA" (simulated)
- Stories get keys like POSP-1041, POSP-1042

### 7. Ship Tab
- Self-ship small (S-sized) stories
- AI generates code changes
- Shows diff, tests, and PR preview

---

## Important Notes

### API Integration

The app currently makes **client-side API calls** to Claude AI (Anthropic). This is for demonstration purposes only.

**⚠️ Current Setup:**
- API calls happen directly from the browser
- Requires CORS to be handled
- API key would be exposed (not included in this demo)

**🔒 For Production:**
1. Create Next.js API routes in `app/api/`
2. Move API logic server-side
3. Store API keys in `.env.local`
4. Call your own API routes from the client

Example API route structure:
```javascript
// app/api/chat/route.js
export async function POST(request) {
  const { messages } = await request.json();
  // Call Claude API here with server-side key
  return Response.json({ response });
}
```

### Demo Mode Features

- **JIRA Creation**: Simulated with timeout delays
- **Live Data**: Uses static JIRA snapshot (20 issues)
- **AI Responses**: Requires API key configuration

---

## Customization

### Update JIRA Data

Edit `app/components/data.js`:
```javascript
export const JIRAS = [
  // Add your JIRA issues here
];
```

### Update Docs

Edit `app/components/data.js`:
```javascript
export const DOCS = [
  // Add your documentation here
];
```

### Change Styles

Edit `app/globals.css` to modify colors, layout, or typography.

---

## Troubleshooting

### Port Already in Use

If port 3000 is busy:
```bash
npm run dev -- -p 3001
```

### Build Errors

Clear cache and rebuild:
```bash
rm -rf .next
npm run build
```

### Module Not Found

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Run the dev server** and explore the UI
2. **Review the code** in `app/components/Blueprint.js`
3. **Customize the data** in `app/components/data.js`
4. **Add API routes** for production-ready API integration
5. **Deploy** to Vercel or your hosting platform

---

## Need Help?

- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Anthropic API: https://docs.anthropic.com

Enjoy your Blueprint application! 🎉

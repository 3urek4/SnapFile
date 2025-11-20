# SnapFile

A beautiful, minimalist file transfer web app with playful animations and modern design. Upload files from anywhere and retrieve them using a unique code. Files automatically delete after 24 hours for privacy.

Made with ❤️ by [3urek4](https://github.com/3urek4)

## ✨ Features

- 🎨 Clean, minimal design with cute gradient animations
- 📤 Drag & drop file uploads
- 🔐 Unique 6-character retrieval codes
- ⏰ 24-hour auto-deletion
- 📱 Fully responsive
- ⚡ Deployed on Vercel with Blob Storage
- 💜 Gradient UI inspired by modern design trends

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click **"Deploy"**

### Step 3: Enable Vercel Blob Storage

After your first deployment:

1. Go to your project dashboard on Vercel
2. Click **"Storage"** tab
3. Click **"Create Database"** → Select **"Blob"**
4. Click **"Create"**
5. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable

That's it! Your app is now live and ready to use. 🎉

## How It Works

### Upload Mode
1. Drag & drop files or click to browse
2. Click "Upload Files"
3. Receive a unique 6-character code
4. Share the code with yourself or others

### Retrieve Mode
1. Switch to "Retrieve" tab
2. Enter the 6-character code
3. Files download automatically
4. Code expires after 24 hours

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Storage**: Vercel Blob Storage
- **Deployment**: Vercel
- **Language**: TypeScript

## File Structure

```
file-transfer-app/
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # Upload endpoint
│   │   └── retrieve/route.ts    # Retrieve endpoint
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main UI component
│   └── globals.css              # Global styles
├── public/                      # Static assets
├── package.json                 # Dependencies
├── next.config.mjs             # Next.js config
├── tailwind.config.js          # Tailwind config
└── tsconfig.json               # TypeScript config
```

## Environment Variables

Vercel automatically sets these when you enable Blob Storage:

- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token (auto-configured)

## Notes

- Maximum file size: Depends on your Vercel plan (typically 4.5 MB on Free, 100 MB+ on Pro)
- Files are stored in Vercel Blob Storage
- Metadata is stored as JSON files
- Auto-cleanup: Files expire after 24 hours (manual cleanup script can be added via Vercel Cron)

## Optional: Add Cron Job for Cleanup

To automatically clean up expired files, add this to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cleanup",
    "schedule": "0 */6 * * *"
  }]
}
```

Then create `app/api/cleanup/route.ts` to delete expired files.

## License

MIT

---

Made with ❤️ by [3urek4](https://github.com/3urek4) using Next.js and Vercel
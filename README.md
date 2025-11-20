# SnapFile

A professional, minimalist file transfer web app with clean design. Upload files from anywhere and retrieve them using a unique code. Files automatically delete after 24 hours for privacy.

Built with **Vite + React + UnoCSS** for blazing fast development! ⚡

Made with ❤️ by [3urek4](https://github.com/3urek4)

## ✨ Features

### Core Features
- 🎨 Clean, professional design inspired by Linear and Vercel
- 📤 Single file upload with drag & drop
- 🔐 Unique 6-character retrieval codes
- ⏰ 24-hour auto-deletion
- 📱 Fully responsive
- ⚡ Deployed on Vercel with Blob Storage
- 🌓 Dark mode support

### New in V2
- 📋 **Copy code button** - One-click copy to clipboard
- 📱 **QR Code generation** - Scan to access on mobile
- 🔗 **Shareable links** - Direct URL sharing
- 📊 **Upload progress bar** - Real-time upload feedback
- 👀 **File preview** - Preview images and PDFs before downloading
- ⬇️ **Download functionality** - Separate download button

### Tech Stack
- ⚡ **Vite** - Lightning fast dev server
- ⚛️ **React 18** - Modern React with hooks
- 🎨 **UnoCSS** - Instant atomic CSS engine
- 📦 **Vercel Blob** - File storage
- 🔧 **TypeScript** - Type safety
- 🎯 **Vercel Serverless Functions** - API endpoints

### Design Philosophy
- **Minimalism** - Clean interface with no unnecessary elements
- **Typography-first** - Clear hierarchy and readable text
- **Neutral palette** - Professional black/white/gray color scheme
- **Accessible** - WCAG compliant contrast ratios
- **Fast** - Instant interactions with smooth transitions

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run development server (super fast!)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Vite + UnoCSS"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Click **"Deploy"**

### Step 3: Enable Vercel Blob Storage

After your first deployment:

1. Go to your project dashboard on Vercel
2. Click **"Storage"** tab
3. Click **"Create Database"** → Select **"Blob"**
4. Give it any name you like
5. Click **"Create"**
6. The `BLOB_READ_WRITE_TOKEN` environment variable will be automatically added

### Step 4: Redeploy

After adding Blob storage, redeploy to activate it:
- Go to **Deployments** → Click **"..."** → **"Redeploy"**

That's it! Your app is live! 🎉

## 🎯 How It Works

### Upload Mode
1. Drag & drop a file or click to browse
2. Watch the progress bar as it uploads
3. Receive a unique 6-character code
4. Copy the code, scan the QR code, or share the direct link
5. Files expire after 24 hours

### Retrieve Mode
1. Switch to "Retrieve" tab
2. Enter the 6-character code (or access via shared link)
3. Preview the file (if it's an image or PDF)
4. Download when ready

## 📁 Project Structure

```
snapfile-v2/
├── src/
│   ├── App.tsx              # Main React component
│   └── main.tsx             # React entry point
├── api/
│   ├── upload.ts            # Upload serverless function
│   └── retrieve.ts          # Retrieve serverless function
├── index.html               # HTML entry
├── vite.config.ts           # Vite configuration
├── uno.config.ts            # UnoCSS configuration
├── vercel.json              # Vercel deployment config
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## 🎨 Design System

This project uses a clean, professional design system:

- **Color palette** - Neutral grays from 50-950 for maximum flexibility
- **Typography** - System fonts with clear hierarchy
- **Spacing** - Consistent spacing scale for visual rhythm
- **Icons** - Carbon Design System icons via UnoCSS

## 🔧 Environment Variables

Vercel automatically sets these when you enable Blob Storage:

- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token (auto-configured)

## 📊 File Size Limits

- Free tier: 4.5 MB per file
- Pro tier: 100 MB+ per file

## 🌟 Why Vite + UnoCSS?

### Vite Benefits
- ⚡ **Instant server start** - No bundling in dev
- 🔥 **Lightning fast HMR** - Sub-100ms updates
- 🎯 **Optimized builds** - Rollup-based production builds
- 📦 **Smart code splitting** - Automatic optimization

### UnoCSS Benefits
- 🚀 **Instant** - No parsing, no extracting, instant
- 🎨 **Flexible** - Fully customizable design system
- 📦 **Tiny bundle** - Only includes used styles
- 💪 **Powerful** - Attributify, variants, shortcuts

## 🎨 Design Credits

Design inspired by [Linear](https://linear.app), [Vercel](https://vercel.com), and [Shadcn/UI](https://ui.shadcn.com)

## 📝 License

MIT

## 🤝 Contributing

Issues and PRs welcome!

---

Made with ❤️ by [3urek4](https://github.com/3urek4) using Vite, React, and UnoCSS
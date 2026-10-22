# AI Product Mockup & Advertising Studio

A professional, production-ready web application for generating high-end commercial product mockups, studio lighting scenes, and advertising visuals using the **Stability AI API** (Stable Image Core & Ultra).

![Mockup Studio AI](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![Stability AI](https://img.shields.io/badge/Powered%20By-Stability%20AI-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

---

## 🌟 Features

- **Drag-and-Drop Image Uploader**: Real-time client-side preview, file validation (PNG, JPEG, WebP up to 10MB), and instant clear/replace.
- **Scene Preset Library**: 9 pre-engineered photographic presets with custom lighting prompts (Luxury Studio, Minimal White, Nature & Botanical, Marble & Premium, Futuristic Display, Festive, Outdoor Lifestyle, E-commerce Catalog, Cinematic Dark).
- **Prompt Formula & Enhancer**: Built-in 5-part formula for high-converting mockups + negative prompt controls.
- **Aspect Ratio Selector**: 6 standard advertising ratios:
  - `1:1` Square (Instagram Post)
  - `3:4` Portrait (Product Shot)
  - `4:3` Landscape (Blog / Web)
  - `9:16` Story / Reel (Instagram & TikTok)
  - `16:9` Widescreen (YouTube / Banner)
  - `21:9` Ultra-wide (Hero Banner)
- **Model Selection & Fine-Tuning**: Switch between `Stable Image Core` and `Stable Image Ultra`, with adjustable Image Strength slider (`0.10` to `1.00`), seed control, and output format (`png`, `jpeg`, `webp`).
- **Real-Time Side-by-Side Comparison**: Interactive Before / After slider to compare the original uploaded product against the AI-rendered advertising scene.
- **Client-Side Gallery (IndexedDB)**: Saved creations persist locally with zero third-party cloud leaks; filter, view metadata, and download in 1 click.
- **Dedicated Prompt Guide**: Complete inspiration library with copyable templates for perfumes, skincare, beverages, sneakers, jewelry, and smartwatches.
- **Server Health & Diagnostic Dashboard**: Real-time verification of Stability API key status, proxy health, and rate limit counters.
- **Dark & Light Mode**: Curated warm-neutral luxury aesthetic with seamless theme transitions.

---

## 🏗️ Architecture

```
mockup-studio-ai/
├── client/                     # Vite + React 18 + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/         # Uploader, PromptEditor, PresetSelector, AspectRatioSelector, GenerationPreview
│   │   ├── hooks/              # IndexedDB useCreations hook
│   │   ├── pages/              # Studio, Creations, PromptGuide, Settings
│   │   ├── services/           # Axios API client & error extractor
│   │   ├── types/              # TypeScript definitions & interfaces
│   │   └── utils/              # Prompt builder & preset constants
│   ├── tailwind.config.js
│   └── vite.config.ts          # Configured with proxy to port 3001
│
├── server/                     # Express + TypeScript + Stability AI Gateway
│   ├── src/
│   │   ├── middleware/         # Multer upload & global error handler
│   │   ├── routes/             # /api/generate, /api/health, /api/models
│   │   ├── services/           # Axios multipart Stability API service
│   │   └── validators/         # Zod parameter validation schemas
│   ├── tests/                  # Vitest suite covering validation, health, mock generations
│   └── .env.example
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v26)
- **npm**: v9+
- **Stability AI API Key**: Get one from [platform.stability.ai](https://platform.stability.ai/account/keys)

### 2. Configure Environment Variables
Inside the `server/` directory, create or edit `.env`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=3001
NODE_ENV=development
STABILITY_API_KEY=sk-your_actual_stability_key_here
MAX_FILE_SIZE_MB=10
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_MS=900000
```

> **Note:** The server securely stores your API key on the backend and NEVER exposes it to the browser.

### 3. Run the Backend Server
```bash
cd server
npm install
npm run dev
```
Backend runs at `http://localhost:3001`. Health check endpoint: `http://localhost:3001/api/health`.

### 4. Run the Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
Client runs at `http://localhost:5173`.

---

## 🧪 Testing

Run backend API tests with Vitest:
```bash
cd server
npm test
```

All 11 integration tests verify:
- Health check & API key redaction
- Model discovery
- Required product image validation
- Aspect ratio and model enum validation
- Error handling & route fallback

---

## 🛡️ Production & Security Best Practices

1. **API Key Security**: The Stability AI API key is strictly held in Node.js environment variables. Client requests pass through `/api/generate`.
2. **File Validation**: Files are strictly validated via MIME type (`image/jpeg`, `image/png`, `image/webp`) and capped at 10 MB.
3. **Rate Limiting**: Built-in Express rate-limiter prevents denial-of-service and accidental API credit exhaustion.
4. **No Server-Side Image Leaks**: Images are received in-memory and proxied directly as multipart payloads without persistent disk caching on the server.

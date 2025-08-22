# SENTINELA-SITE API Documentation

## 🚀 Quick Start

### Frontend (Static Site)
```bash
# Serve static files
npx serve .
# or
python -m http.server 8000
```

### Backend (Next.js API)
```bash
cd backend
npm install
npm run dev    # Development server on http://localhost:3000
npm run build  # Production build
npm start      # Production server
```

### Testing
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📡 API Endpoints

### 1. POST /api/denuncias

Submit a new report/complaint.

**Request:**
```json
{
  "description": "Detailed description (min 30 chars, max 5000)",
  "subject": "Optional subject (max 200 chars)",
  "email": "optional@email.com",
  "phone": "Optional phone number",
  "area": "Optional area/category"
}
```

**Response (201):**
```json
{
  "ok": true,
  "id": "uuid-v4",
  "protocol": "SNT-ABC123",
  "message": "Denúncia registrada com sucesso"
}
```

**Rate Limiting:** 5 requests per hour per IP

**Error Responses:**
- `400` - Validation errors
- `429` - Rate limit exceeded
- `500` - Server error

### 2. GET /api/news

Fetch aggregated news from multiple sources.

**Response (200):**
```json
{
  "items": [
    {
      "title": "News title",
      "link": "https://...",
      "description": "News summary",
      "image": "https://...",
      "tag": "Source name"
    }
  ],
  "timestamp": "2025-08-22T19:30:00.000Z",
  "sources": 2
}
```

**Caching:** 10 minutes (600 seconds)

### 3. POST /api/chatbot 🤖 **NEW**

Interact with the Gemini AI-powered chatbot for transparency and civic education.

**Request:**
```json
{
  "message": "Como funciona a Lei de Acesso à Informação?",
  "conversationId": "optional-uuid-for-context"
}
```

**Response (200):**
```json
{
  "response": "A Lei de Acesso à Informação (LAI) garante...",
  "conversationId": "uuid-v4",
  "timestamp": "2025-08-22T20:00:00.000Z"
}
```

**Features:**
- 🧠 **Specialized Knowledge**: Trained on transparency, civic rights, and public administration
- 💬 **Conversation Context**: Maintains context across multiple messages
- ⚡ **Real-time Responses**: Powered by Google Gemini 1.5 Flash
- 🛡️ **Safety Filters**: Content moderation and appropriate responses
- 📚 **Educational Focus**: Explains complex civic concepts in simple terms

**Rate Limiting:** 20 messages per hour per IP

**Error Responses:**
- `400` - Invalid message format or content
- `429` - Rate limit exceeded
- `500` - AI service error (includes fallback message)

### 4. GET /api/og

Generate Open Graph metadata for social sharing.

**Parameters:**
- `title` - Page title
- `description` - Page description

## 🔧 Environment Variables

Create `.env.local` in the backend directory:

```env
# Vercel KV (Required for denuncias API)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# Google Gemini AI (Required for chatbot) 🤖
GEMINI_API_KEY=your_gemini_api_key

# Optional
NODE_ENV=development
DENUNCIAS_RATE_LIMIT=5
CHATBOT_RATE_LIMIT=20
```

### How to get API Keys:

**Vercel KV:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to "Storage" → "Create Database" → "KV"
3. Create a new KV database
4. Copy the connection details

**Google Gemini AI:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key to your environment variables

## 🛡️ Security Features

### Rate Limiting
- **Denuncias API:** 5 requests per hour per IP
- **Storage:** Vercel KV with automatic expiry

### Input Validation
- Description: 30-5000 characters
- Email: Valid email format
- Subject: Max 200 characters
- Automatic HTML/script sanitization

### CORS Policy
- **Allowed Origins:** All (`*`)
- **Allowed Methods:** GET, POST, OPTIONS
- **Allowed Headers:** Content-Type

## 📊 Performance Features

### Caching Strategy
- **Frontend:** Service Worker caches static assets
- **Backend:** Response caching (10 minutes for news)
- **CDN:** Font Awesome from CDN

### Optimization
- **Images:** Lazy loading with `loading="lazy"`
- **JavaScript:** Minified and optimized
- **CSS:** External stylesheet with variables
- **API:** Edge runtime for low latency

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Coverage Report
```bash
npm run test:coverage
```

### Test Structure
```
backend/
├── app/api/
│   └── denuncias/
│       ├── route.ts
│       └── __tests__/
│           └── route.test.ts
├── jest.config.js
└── jest.setup.js
```

## 🚀 Deployment

### Frontend
Deploy to any static hosting:
- **Vercel:** `vercel --prod`
- **Netlify:** Connect GitHub repo
- **GitHub Pages:** Enable in repository settings

### Backend
Deploy to Vercel:
```bash
cd backend
vercel --prod
```

### Environment Setup
1. Create Vercel KV database
2. Add environment variables in Vercel dashboard
3. Deploy backend first, then frontend

## 📱 PWA Features

### Service Worker
- Caches static assets for offline access
- Automatic cache versioning (`sentinela-v2`)
- Fallback to index.html for SPA behavior

### Manifest
- **Name:** Sentinela Nativense
- **Theme:** #1a3a6e (Blue)
- **Display:** Standalone
- **Icons:** SVG + PNG fallbacks

### Installation
Users can install the app:
1. Visit the site on mobile
2. Tap "Add to Home Screen"
3. App works offline for cached content

## 🔍 Monitoring & Analytics

### Error Tracking
- Console logging for API errors
- Structured error responses
- Rate limiting metrics in KV

### Metrics Available
- Total denuncias count (`stats:denuncias:total`)
- Rate limiting data per IP
- API response times (Edge runtime)

## 🛠️ Development Tips

### Local Development
1. Start backend: `cd backend && npm run dev`
2. Serve frontend: `npx serve . -p 8080`
3. Update CORS origins if needed

### Database Inspection
Use Vercel KV dashboard to inspect:
- `denuncia:{uuid}` - Individual reports
- `denuncia:index` - Sorted index
- `rate_limit:{ip}` - Rate limiting counters

### CSS Variables
Customize theme by editing `assets/css/main.css`:
```css
:root {
  --primary: #1a3a6e;    /* Main blue */
  --secondary: #d4af37;  /* Gold accent */
  --dark: #2c3e50;       /* Text color */
}
```

## 🐛 Troubleshooting

### Common Issues

**Service Worker not updating:**
```javascript
// Clear cache manually
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

**API not working:**
1. Check environment variables
2. Verify Vercel KV setup
3. Check CORS headers

**PWA not installing:**
1. Verify HTTPS (required for PWA)
2. Check manifest.json syntax
3. Ensure service worker is registered

### Debug Mode
Add to any page for debugging:
```javascript
console.log('SW supported:', 'serviceWorker' in navigator);
console.log('Manifest:', document.querySelector('link[rel="manifest"]'));
```
# 🚀 SENTINELA Deployment Guide

## ✅ **API Key Configured Successfully!**

Your Gemini API key `AIzaSyAB9KgoS7KYI9427zzW7GdwdAXmGawj6o0` has been configured for:
- ✅ Local development (`.env.local`)
- ✅ Example template (`.env.example`)
- ✅ Test script included

---

## 🧪 **Test the Chatbot Locally**

### 1. Install Dependencies & Test API
```bash
cd backend
npm install
npm run test:gemini  # Test the Gemini API key
```

### 2. Start Development Servers
```bash
# Terminal 1: Backend API
cd backend
npm run dev  # Starts on http://localhost:3000

# Terminal 2: Frontend (new terminal)
cd ..  # Go to project root
npx serve .  # Starts on http://localhost:3000 or 5000
```

### 3. Test the Chatbot
1. Open `http://localhost:3000` (or the port shown)
2. Look for the 🤖 icon in bottom-right corner
3. Click it and try asking: "Como funciona a Lei de Acesso à Informação?"

---

## 🌐 **Deploy to Production**

### **Step 1: Deploy Backend to Vercel**
```bash
cd backend
npm install -g vercel  # If not installed
vercel login
vercel --prod
```

### **Step 2: Set Environment Variables in Vercel**
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
GEMINI_API_KEY = AIzaSyAB9KgoS7KYI9427zzW7GdwdAXmGawj6o0
NODE_ENV = production
CHATBOT_RATE_LIMIT = 20
DENUNCIAS_RATE_LIMIT = 5
```

### **Step 3: Deploy Frontend**
```bash
cd ..  # Back to project root
vercel --prod
```

### **Step 4: Update API URLs (if needed)**
If your frontend and backend are on different domains, update the chatbot API URL in:
- `assets/js/chatbot.js` (line ~339)

---

## 🔧 **Troubleshooting**

### **Chatbot Not Working?**
1. **Check API Key**: Run `npm run test:gemini` in backend folder
2. **Check Console**: Open browser DevTools → Console for errors
3. **Check Network**: DevTools → Network tab for failed API calls
4. **Check Rate Limits**: Max 20 messages/hour per IP

### **Common Issues:**
- **"API key not configured"**: Environment variable not set
- **CORS errors**: Backend not running or wrong URL
- **Rate limit**: Wait 1 hour or restart backend

### **Debug Mode:**
Add this to browser console to test:
```javascript
// Test chatbot API directly
fetch('/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Teste' })
}).then(r => r.json()).then(console.log);
```

---

## 🎯 **Next Steps**

### **For Vercel KV (Denuncias)**
When ready to enable the complaints system:
1. Create Vercel KV database
2. Add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to environment variables

### **Custom Domain**
1. Add your domain in Vercel project settings
2. Update CORS origins in environment variables
3. Update PWA manifest URLs

### **Monitoring**
- Check Vercel Analytics for usage
- Monitor API costs in Google Cloud Console
- Review chatbot conversations in Vercel KV (when enabled)

---

## 📊 **Current Features Status**

- ✅ **Gemini AI Chatbot**: Ready with your API key
- ✅ **Modern UI**: Updated design and animations  
- ✅ **PWA**: Installable app with offline support
- ✅ **Responsive**: Works on all devices
- ✅ **Performance**: Optimized with caching
- ⏳ **Denuncias**: Needs Vercel KV setup
- ⏳ **News**: Ready to go

---

## 🎉 **You're Ready to Deploy!**

The chatbot is fully configured and ready to help citizens with transparency questions. Just run the deployment commands above and your AI-powered transparency portal will be live!

**Need help?** The chatbot can explain:
- Lei de Acesso à Informação (LAI)
- How to make complaints
- Public budget oversight
- Transparency concepts
- Citizen rights

🚀 **Happy deploying!**
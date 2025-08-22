#!/usr/bin/env node

console.log('🚀 SENTINELA Quick Start Guide\n');

const fs = require('fs');
const path = require('path');

// Check if we're in the right directory
if (!fs.existsSync('backend') || !fs.existsSync('index.html')) {
    console.error('❌ Please run this from the SENTINELA project root directory');
    process.exit(1);
}

console.log('✅ Project structure verified\n');

// Check environment setup
const envPath = 'backend/.env.local';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('GEMINI_API_KEY=AIzaSy')) {
        console.log('✅ Gemini API key configured');
    } else {
        console.log('❌ Gemini API key missing');
    }
} else {
    console.log('❌ .env.local file missing');
}

console.log('\n🔧 Setup Steps:');
console.log('1. Make sure you have two terminals open');
console.log('2. In Terminal 1, run the backend:');
console.log('   cd backend');
console.log('   npm install');
console.log('   npm run dev');
console.log('   → Backend will start on http://localhost:3000');

console.log('\n3. In Terminal 2, run the frontend:');
console.log('   npx serve .');
console.log('   → Frontend will start on http://localhost:3000 or http://localhost:5000');

console.log('\n🧪 Testing:');
console.log('1. Open the frontend URL in your browser');
console.log('2. Look for the 🤖 chatbot icon (bottom-right corner)');
console.log('3. Click it and try: "Como funciona a transparência pública?"');

console.log('\n🔍 Debugging:');
console.log('• Open browser DevTools → Console to see debug logs');
console.log('• Check Network tab for API calls');
console.log('• Backend should be running on port 3000');
console.log('• Frontend can be on any port (5000, 3001, etc.)');

console.log('\n📋 Common Issues:');
console.log('• "API não encontrado": Backend not running on port 3000');
console.log('• "CORS error": Try restarting both servers');
console.log('• "Rate limit": Wait 1 hour or restart backend');

console.log('\n✨ Ready to test your AI chatbot! 🤖');
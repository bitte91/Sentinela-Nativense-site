#!/usr/bin/env node

// Quick troubleshooting script for SENTINELA site
console.log('🔧 SENTINELA Troubleshooting Tool\n');

const fs = require('fs');
const path = require('path');

// Check if we're in the right directory
if (!fs.existsSync('backend') || !fs.existsSync('index.html')) {
    console.error('❌ Please run this script from the SENTINELA project root directory');
    process.exit(1);
}

console.log('✅ Project structure looks good');

// Check backend files
const backendFiles = [
    'backend/package.json',
    'backend/.env.local',
    'backend/app/api/chatbot/route.ts'
];

console.log('\n📁 Checking backend files:');
backendFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

// Check frontend files
const frontendFiles = [
    'assets/js/chatbot.js',
    'assets/css/main.css',
    'assets/icons/icon.svg',
    'manifest.json'
];

console.log('\n🌐 Checking frontend files:');
frontendFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

// Check environment variables
console.log('\n🔑 Checking environment:');
const envPath = 'backend/.env.local';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('GEMINI_API_KEY=AIzaSy')) {
        console.log('✅ Gemini API key found');
    } else {
        console.log('❌ Gemini API key not found or invalid');
    }
} else {
    console.log('❌ .env.local file missing');
}

// Common solutions
console.log('\n💡 Quick Fixes:');
console.log('1. Backend 404 error: cd backend && npm install && npm run dev');
console.log('2. Manifest 404: Check if manifest.json exists in root');
console.log('3. Chatbot not working: Check browser console for errors');
console.log('4. API key error: Verify GEMINI_API_KEY in backend/.env.local');

console.log('\n🚀 Start commands:');
console.log('Terminal 1: cd backend && npm run dev');
console.log('Terminal 2: npx serve . (from project root)');

console.log('\n✨ All checks complete!');
#!/usr/bin/env node

// Simple test script to verify Gemini API key
// Run with: node test-gemini-api.js

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 API Key found:', GEMINI_API_KEY.substring(0, 10) + '...');

async function testGeminiAPI() {
  try {
    console.log('🧪 Testing Gemini API connection...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Olá! Responda brevemente: você é o assistente do Sentinela Nativense?' }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return false;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('✅ API Test Successful!');
      console.log('🤖 AI Response:', aiResponse);
      return true;
    } else {
      console.error('❌ Unexpected response format:', data);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testGeminiAPI()
  .then(success => {
    if (success) {
      console.log('\n🎉 Gemini API is working correctly!');
      console.log('📝 Next steps:');
      console.log('   1. Start the backend: npm run dev');
      console.log('   2. Test the chatbot on the website');
      console.log('   3. Deploy with Vercel environment variables');
    } else {
      console.log('\n💔 API test failed. Please check your API key.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
import { POST, OPTIONS } from '../route';
import { NextRequest } from 'next/server';

// Mock Vercel KV
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
  }
}));

// Mock fetch for Gemini API
global.fetch = jest.fn();

describe('/api/chatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  describe('POST', () => {
    it('should accept valid chat messages', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0); // Rate limit check
      kv.set.mockResolvedValue('OK');
      kv.incr.mockResolvedValue(1);

      // Mock Gemini API response
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: 'A Lei de Acesso à Informação garante ao cidadão o direito de solicitar informações dos órgãos públicos.'
              }]
            }
          }]
        })
      });

      const request = new NextRequest('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          message: 'Como funciona a Lei de Acesso à Informação?'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response).toContain('Lei de Acesso à Informação');
      expect(data.conversationId).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should reject very short messages', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0); // Rate limit check

      const request = new NextRequest('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          message: 'Oi'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('3 caracteres');
    });

    it('should reject very long messages', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0); // Rate limit check

      const longMessage = 'A'.repeat(1001);

      const request = new NextRequest('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          message: longMessage
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('1000 caracteres');
    });

    it('should apply rate limiting', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(20); // Rate limit exceeded

      const request = new NextRequest('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          message: 'Como funciona a transparência pública?'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Muitas mensagens');
    });

    it('should handle missing Gemini API key', async () => {
      delete process.env.GEMINI_API_KEY;
      
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          message: 'Como funciona a transparência pública?'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.fallback).toBeDefined();
    });

    it('should handle Gemini API errors gracefully', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0);
      kv.set.mockResolvedValue('OK');
      kv.incr.mockResolvedValue(1);

      // Mock Gemini API error
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'API Error'
      });

      const request = new NextRequest('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          message: 'Como funciona a transparência pública?'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.fallback).toBeDefined();
    });
  });

  describe('OPTIONS', () => {
    it('should handle preflight requests', async () => {
      const response = await OPTIONS();
      
      expect(response.status).toBe(200);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(response.headers.get('access-control-allow-methods')).toContain('POST');
    });
  });
});
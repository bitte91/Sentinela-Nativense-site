import { POST, OPTIONS } from '../route';
import { NextRequest } from 'next/server';

// Mock Vercel KV
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
    hset: jest.fn(),
    zadd: jest.fn(),
    incr: jest.fn(),
  }
}));

describe('/api/denuncias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should accept valid denuncias', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0); // Rate limit check
      kv.set.mockResolvedValue('OK');
      kv.hset.mockResolvedValue(1);
      kv.zadd.mockResolvedValue(1);
      kv.incr.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/denuncias', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          description: 'Esta é uma descrição válida com mais de 30 caracteres para teste',
          subject: 'Assunto de teste',
          email: 'test@example.com'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.ok).toBe(true);
      expect(data.protocol).toMatch(/^SNT-/);
      expect(data.message).toBe('Denúncia registrada com sucesso');
    });

    it('should reject short descriptions', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0); // Rate limit check

      const request = new NextRequest('http://localhost:3000/api/denuncias', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          description: 'Muito curto'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('30 caracteres');
    });

    it('should reject invalid emails', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(0); // Rate limit check

      const request = new NextRequest('http://localhost:3000/api/denuncias', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          description: 'Esta é uma descrição válida com mais de 30 caracteres para teste',
          email: 'email-inválido'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('E-mail inválido');
    });

    it('should apply rate limiting', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockResolvedValue(5); // Rate limit exceeded

      const request = new NextRequest('http://localhost:3000/api/denuncias', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          description: 'Esta é uma descrição válida com mais de 30 caracteres para teste'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Muitas tentativas');
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
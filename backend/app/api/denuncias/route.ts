import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

type Payload = {
  description: string;
  subject?: string;
  email?: string;
  phone?: string;
  area?: string;
};

function protocol() {
  return 'SNT-' + Date.now().toString(36).toUpperCase();
}

// Simple rate limiting using KV store
async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const current = await kv.get(key) as number || 0;
  
  if (current >= 5) { // 5 requests per hour
    return false;
  }
  
  await kv.set(key, current + 1, { ex: 3600 }); // 1 hour expiry
  return true;
}

// Input validation
function validateInput(body: Payload): string | null {
  if (!body?.description || typeof body.description !== 'string') {
    return 'Descrição é obrigatória';
  }
  
  if (body.description.trim().length < 30) {
    return 'Descreva os fatos com pelo menos 30 caracteres';
  }
  
  if (body.description.trim().length > 5000) {
    return 'Descrição muito longa (máx. 5000 caracteres)';
  }
  
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'E-mail inválido';
  }
  
  return null;
}

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    const withinLimit = await checkRateLimit(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 1 hora.' }, 
        { status: 429 }
      );
    }
    
    const body = (await req.json()) as Payload;
    
    // Validate input
    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    
    const id = crypto.randomUUID();
    const proto = protocol();
    
    const item = {
      id,
      proto,
      subject: body.subject?.trim().slice(0, 200) || null,
      description: body.description.trim(),
      contact: { 
        email: body.email?.trim() || null, 
        phone: body.phone?.trim() || null 
      },
      area: body.area?.trim() || null,
      status: 'recebida',
      ip: ip.slice(0, 15), // Store partial IP for analytics
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in KV with error handling
    await Promise.all([
      kv.hset('denuncia:' + id, item),
      kv.zadd('denuncia:index', { score: Date.now(), member: id }),
      kv.incr('stats:denuncias:total') // Simple counter
    ]);

    return NextResponse.json(
      { 
        ok: true, 
        id, 
        protocol: proto,
        message: 'Denúncia registrada com sucesso' 
      }, 
      {
        status: 201,
        headers: { 
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'POST',
          'access-control-allow-headers': 'Content-Type'
        }
      }
    );
  } catch (e) {
    console.error('Denuncias API Error:', e);
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' }, 
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'Content-Type',
    },
  });
}

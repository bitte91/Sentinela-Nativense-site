import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

type ChatRequest = {
  message: string;
  conversationId?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

// Rate limiting for chatbot (more generous than denuncias)
async function checkChatRateLimit(ip: string): Promise<boolean> {
  const key = `chat_rate_limit:${ip}`;
  const current = await kv.get(key) as number || 0;
  
  if (current >= 20) { // 20 messages per hour
    return false;
  }
  
  await kv.set(key, current + 1, { ex: 3600 }); // 1 hour expiry
  return true;
}

// Input validation for chat messages
function validateChatInput(body: ChatRequest): string | null {
  if (!body?.message || typeof body.message !== 'string') {
    return 'Mensagem é obrigatória';
  }
  
  if (body.message.trim().length < 3) {
    return 'Mensagem muito curta (mín. 3 caracteres)';
  }
  
  if (body.message.trim().length > 1000) {
    return 'Mensagem muito longa (máx. 1000 caracteres)';
  }
  
  return null;
}

// Generate conversation context for Gemini
function generateSystemPrompt(): string {
  return `Você é o assistente virtual do Sentinela Nativense, um portal de transparência pública focado em Natividade da Serra e região.

SOBRE O SENTINELA:
- Portal de jornalismo investigativo e transparência municipal
- Foco em educação cívica, direitos do cidadão, e combate à corrupção
- Especialista em legislação municipal, orçamento público, e processos administrativos
- Promove transparência, educação e ação cidadã

SUAS RESPONSABILIDADES:
1. Explicar conceitos de transparência pública de forma didática
2. Orientar sobre direitos do cidadão e como exercê-los
3. Esclarecer processos de licitação, orçamento e gestão municipal
4. Ajudar com Lei de Acesso à Informação (LAI)
5. Explicar como fazer denúncias e acompanhar processos
6. Falar sobre fiscalização de obras públicas e contratos

DIRETRIZES:
- Use linguagem clara e acessível
- Seja educativo mas não preachy
- Foque em ações práticas que o cidadão pode tomar
- Sempre incentive a participação democrática
- Mantenha tom profissional mas amigável
- Para questões específicas de Natividade da Serra, sugira consultar o site oficial da prefeitura

EVITE:
- Dar conselhos jurídicos específicos
- Fazer acusações ou afirmações categóricas sobre casos específicos
- Política partidária
- Informações que não pode verificar

Responda sempre em português brasileiro, de forma educativa e prática.`;
}

async function callGeminiAPI(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Build conversation context
  const systemPrompt = generateSystemPrompt();
  
  // Format messages for Gemini
  const messages = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Entendi! Sou o assistente do Sentinela Nativense e estou pronto para ajudar com questões de transparência pública e educação cívica. Como posso ajudá-lo?' }] },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API Error:', error);
    throw new Error('Falha na comunicação com a IA');
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Resposta inválida da IA');
  }

  return data.candidates[0].content.parts[0].text;
}

// Store conversation in KV for context
async function storeConversation(conversationId: string, message: ChatMessage): Promise<void> {
  const key = `conversation:${conversationId}`;
  const conversation = await kv.get(key) as ChatMessage[] || [];
  
  conversation.push(message);
  
  // Keep only last 10 messages to avoid token limits
  if (conversation.length > 10) {
    conversation.splice(0, conversation.length - 10);
  }
  
  await kv.set(key, conversation, { ex: 7200 }); // 2 hours expiry
}

async function getConversation(conversationId: string): Promise<ChatMessage[]> {
  const key = `conversation:${conversationId}`;
  return await kv.get(key) as ChatMessage[] || [];
}

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    const withinLimit = await checkChatRateLimit(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Muitas mensagens. Aguarde um pouco antes de continuar.' }, 
        { status: 429 }
      );
    }
    
    const body = (await req.json()) as ChatRequest;
    
    // Validate input
    const validationError = validateChatInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    
    const conversationId = body.conversationId || crypto.randomUUID();
    const userMessage = body.message.trim();
    
    // Get conversation history
    const conversationHistory = await getConversation(conversationId);
    
    // Call Gemini API
    const aiResponse = await callGeminiAPI(userMessage, conversationHistory);
    
    // Store user message and AI response
    const timestamp = new Date().toISOString();
    
    await Promise.all([
      storeConversation(conversationId, {
        role: 'user',
        content: userMessage,
        timestamp
      }),
      storeConversation(conversationId, {
        role: 'assistant',
        content: aiResponse,
        timestamp
      }),
      kv.incr('stats:chatbot:messages') // Simple counter
    ]);

    return NextResponse.json(
      { 
        response: aiResponse,
        conversationId,
        timestamp
      }, 
      {
        status: 200,
        headers: { 
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'POST',
          'access-control-allow-headers': 'Content-Type'
        }
      }
    );
    
  } catch (error) {
    console.error('Chatbot API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        fallback: 'Desculpe, estou temporariamente indisponível. Tente novamente em alguns instantes ou explore os conteúdos do Sentinela Explica.'
      }, 
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
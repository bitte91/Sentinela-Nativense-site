import { NextResponse } from 'next/server';
import { fromG1, fromBand } from '@/lib/news';

export const runtime = 'edge';
export const revalidate = 600; // 10min

export async function GET() {
  try {
    const out: any[] = [];
    
    // Fetch from multiple sources with timeout
    const sources = await Promise.allSettled([
      Promise.race([
        fromG1(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('G1 timeout')), 8000))
      ]),
      Promise.race([
        fromBand(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Band timeout')), 8000))
      ])
    ]);
    
    sources.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        out.push(...(result.value as any[]));
      } else {
        console.warn(`Source ${index} failed:`, result.reason);
      }
    });
    
    // Deduplicate by title
    const seen = new Set();
    const unique = out.filter(item => {
      const key = item.title?.toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    return NextResponse.json(
      { 
        items: unique.slice(0, 24),
        timestamp: new Date().toISOString(),
        sources: sources.length
      }, 
      {
        headers: { 
          'access-control-allow-origin': '*',
          'cache-control': 'public, max-age=600', // 10 minutes
        }
      }
    );
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar notícias',
        items: [],
        timestamp: new Date().toISOString()
      }, 
      { 
        status: 500,
        headers: { 'access-control-allow-origin': '*' }
      }
    );
  }
}

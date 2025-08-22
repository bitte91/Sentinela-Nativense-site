# 🛡️ Sentinela Nativense

> **Portal de Transparência Pública e Jornalismo Investigativo**

Um sistema completo para transparência municipal, canal de denúncias, e agregação de notícias regionais, focado em Natividade da Serra e região.

![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![Tests](https://img.shields.io/badge/Tests-Passing-success)

## ✨ Funcionalidades

### 🏠 **Portal Principal**
- ✅ Design responsivo e moderno
- ✅ PWA (Progressive Web App) - funciona offline
- ✅ Animações suaves e lazy loading
- ✅ Agregação automática de notícias regionais
- ✅ Seção "Sentinela Explica" educativa
- ✅ Newsletter signup

### 📝 **Sistema de Denúncias**
- ✅ Formulário seguro com validação
- ✅ Protocolo automático (SNT-XXXXX)
- ✅ Rate limiting (5 por hora por IP)
- ✅ Armazenamento em Vercel KV
- ✅ Preview de denúncia antes do envio
- ✅ Salvamento local de rascunhos

### 📰 **Agregador de Notícias**
- ✅ Múltiplas fontes (G1 Vale, O Vale, Vale360, Google News)
- ✅ Fallbacks automáticos quando APIs falham
- ✅ Cache de 10 minutos para performance
- ✅ Deduplicação por título
- ✅ Timeout protection (8s por fonte)

### 🤖 **Assistente Virtual com IA** 🎆 **NOVO**
- ✅ Chatbot inteligente powered by Google Gemini AI
- ✅ Especializado em transparência pública e direitos do cidadão
- ✅ Conversações contextuais com memória
- ✅ Interface moderna com animações
- ✅ Rate limiting (20 mensagens/hora)
- ✅ Respostas educativas sobre LAI, orçamento, licitações
- ✅ Disponível em "Sentinela Explica" e página principal

### 🔧 **Melhorias Técnicas Implementadas**
- ✅ CSS extraído para arquivo externo (melhor cache)
- ✅ PWA icons e manifest completos
- ✅ Service Worker otimizado
- ✅ Meta tags para SEO e Open Graph
- ✅ Rate limiting no backend
- ✅ Testes unitários com Jest
- ✅ CI/CD com GitHub Actions
- ✅ Lighthouse CI para monitoramento de performance
- ✅ Documentação da API completa

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Frontend (Site Estático)
```bash
# Servir arquivos estáticos
npx serve .
# ou
python -m http.server 8000
```

### Backend (APIs)
```bash
cd backend
npm install
npm run dev    # Desenvolvimento
npm run build  # Build para produção  
npm start      # Produção
```

### Testes
```bash
cd backend
npm test              # Executar testes
npm run test:watch    # Modo watch
npm run test:coverage # Relatório de cobertura
```

## 📁 Estrutura do Projeto

```
├── 📄 index.html              # Homepage principal
├── 📁 pages/                  # Páginas estáticas (15 páginas)
├── 📁 assets/
│   ├── 📁 css/               # Estilos externos
│   ├── 📁 js/                # JavaScript principal
│   ├── 📁 data/              # Dados JSON
│   ├── 📁 icons/             # Ícones PWA
│   └── 📁 video/             # Assets de vídeo
├── 📁 backend/               # APIs Next.js
│   ├── 📁 app/api/
│   │   ├── 📁 denuncias/     # API de denúncias
│   │   ├── 📁 news/          # API de notícias
│   │   └── 📁 og/            # Open Graph API
│   └── 📁 __tests__/         # Testes unitários
├── 📁 .github/workflows/     # CI/CD
├── 📄 manifest.json          # PWA manifest
├── 📄 service-worker.js      # Service worker
├── 📄 API_DOCS.md           # Documentação da API
└── 📄 lighthouserc.js       # Config do Lighthouse
```

## 🛡️ Segurança

### Rate Limiting
- **Denúncias:** 5 tentativas por hora por IP
- **Storage:** Vercel KV com expiração automática

### Validação de Input
- Descrição: 30-5000 caracteres
- E-mail: Formato válido
- Sanitização automática de HTML/scripts

### CORS
- Origins permitidos: Todos (`*`)
- Methods: GET, POST, OPTIONS
- Headers: Content-Type

## 📊 Performance

### Estratégia de Cache
- **Frontend:** Service Worker para assets estáticos
- **Backend:** Cache de resposta (10 min para notícias)
- **CDN:** Font Awesome via CDN

### Otimizações
- **Imagens:** Lazy loading automático
- **JavaScript:** Minificado e otimizado
- **CSS:** Variáveis CSS para consistência
- **API:** Edge runtime para baixa latência

## 🧪 Testes

### Cobertura
- ✅ Testes da API de denúncias
- ✅ Validação de entrada
- ✅ Rate limiting
- ✅ Tratamento de erros

### CI/CD
- ✅ Testes automáticos no GitHub Actions
- ✅ Lighthouse CI para performance
- ✅ Security scanning com Trivy
- ✅ Deploy automático para Vercel

## 🚀 Deploy

### Frontend
- **Vercel:** `vercel --prod`
- **Netlify:** Conectar repositório GitHub
- **GitHub Pages:** Habilitar nas configurações

### Backend 
```bash
cd backend
vercel --prod
```

### Variáveis de Ambiente
Crie `.env.local` no diretório backend:
```env
# Obrigatório para denúncias
KV_REST_API_URL=sua_url_kv
KV_REST_API_TOKEN=seu_token_kv

# Obrigatório para chatbot IA 🤖
GEMINI_API_KEY=sua_chave_gemini

# Opcional
NODE_ENV=development
DENUNCIAS_RATE_LIMIT=5
CHATBOT_RATE_LIMIT=20
```

### Como obter as chaves:
**Vercel KV:** [Dashboard](https://vercel.com/dashboard) → Storage → Create KV Database  
**Google Gemini:** [AI Studio](https://aistudio.google.com/) → Create API Key

## 📱 PWA

### Instalação
1. Visite o site no mobile
2. Toque em "Adicionar à Tela Inicial"
3. App funciona offline para conteúdo cacheado

### Service Worker
- Cache de assets estáticos
- Versionamento automático de cache
- Fallback para index.html (comportamento SPA)

## 📖 Documentação

- **[API Documentation](API_DOCS.md)** - Guia completo das APIs
- **[Lighthouse Config](lighthouserc.js)** - Configuração de performance
- **[CI/CD Pipeline](.github/workflows/ci.yml)** - Automação

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Executando Localmente
1. Clone o repositório
2. Instale dependências: `cd backend && npm install`
3. Configure variáveis de ambiente
4. Execute testes: `npm test`
5. Inicie desenvolvimento: `npm run dev`

## 📧 Contato

- **Website:** [sentinela-site.vercel.app](https://sentinela-site.vercel.app)
- **Email:** contato@sentinelasite.com
- **Telefone:** (12) 3456-7890

## 📄 Licença

© 2025 Sentinela Nativense - Transparência e Ação Cidadã. Todos os direitos reservados.

---

### 🛠️ Tecnologias Utilizadas

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- PWA (Progressive Web App)
- Service Worker para cache offline
- Intersection Observer para animações
- Font Awesome para ícones

**Backend:**
- Next.js 14 com TypeScript
- Vercel Edge Runtime
- Vercel KV para armazenamento
- Rate limiting e validação

**DevOps:**
- GitHub Actions para CI/CD
- Jest para testes unitários
- Lighthouse CI para performance
- Vercel para deploy automático

**Performance:**
- Lazy loading de imagens
- CSS minificado com variáveis
- API caching (10 minutos)
- Service Worker offline-first

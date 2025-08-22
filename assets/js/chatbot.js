// Sentinela Chatbot Module
class SentinelaChatbot {
    constructor(apiUrl = '/api/chatbot') {
        this.apiUrl = apiUrl;
        this.conversationId = null;
        this.isOpen = false;
        this.isTyping = false;
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.showWelcomeMessage();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-container" id="sentinelaChatbot">
                <button class="chatbot-toggle" id="chatbotToggle" title="Abrir Assistente Sentinela">
                    🤖
                </button>
                
                <div class="chatbot-widget" id="chatbotWidget">
                    <div class="chatbot-header">
                        <h3>🛡️ Assistente Sentinela</h3>
                        <button class="chatbot-close" id="chatbotClose" title="Fechar">×</button>
                    </div>
                    
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="chatbot-starter">
                            <div class="chatbot-starter-title">Como posso ajudá-lo hoje?</div>
                            <button class="chatbot-starter-option" data-message="Como funciona a Lei de Acesso à Informação?">
                                📋 Lei de Acesso à Informação
                            </button>
                            <button class="chatbot-starter-option" data-message="Como fazer uma denúncia?">
                                📢 Como fazer denúncia
                            </button>
                            <button class="chatbot-starter-option" data-message="O que é transparência pública?">
                                🔍 Transparência pública
                            </button>
                            <button class="chatbot-starter-option" data-message="Como fiscalizar o orçamento municipal?">
                                💰 Fiscalização orçamentária
                            </button>
                        </div>
                    </div>
                    
                    <div class="chatbot-input-container">
                        <textarea 
                            class="chatbot-input" 
                            id="chatbotInput" 
                            placeholder="Digite sua pergunta sobre transparência pública..."
                            rows="1"
                            maxlength="1000"
                        ></textarea>
                        <button class="chatbot-send" id="chatbotSend" title="Enviar mensagem">
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const send = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const widget = document.getElementById('chatbotWidget');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        input.addEventListener('input', () => {
            this.autoResizeTextarea(input);
        });

        // Handle starter options
        widget.addEventListener('click', (e) => {
            if (e.target.classList.contains('chatbot-starter-option')) {
                const message = e.target.dataset.message;
                if (message) {
                    this.sendPredefinedMessage(message);
                }
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            const container = document.getElementById('sentinelaChatbot');
            if (this.isOpen && !container.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    toggleChat() {
        const widget = document.getElementById('chatbotWidget');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            widget.classList.add('open');
            document.getElementById('chatbotInput').focus();
        } else {
            widget.classList.remove('open');
        }
    }

    closeChat() {
        const widget = document.getElementById('chatbotWidget');
        this.isOpen = false;
        widget.classList.remove('open');
    }

    showWelcomeMessage() {
        // Welcome message is already in the starter options
    }

    addMessage(content, type = 'assistant', isHTML = false) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${type}`;
        
        if (isHTML) {
            messageDiv.innerHTML = content;
        } else {
            messageDiv.textContent = content;
        }
        
        // Remove starter options if this is the first real message
        const starter = messagesContainer.querySelector('.chatbot-starter');
        if (starter && type === 'user') {
            starter.remove();
        }
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message chatbot-typing';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            Pensando...
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        this.sendUserMessage(message);
        input.value = '';
        input.style.height = 'auto';
    }

    sendPredefinedMessage(message) {
        this.sendUserMessage(message);
    }

    async sendUserMessage(message) {
        // Add user message
        this.addMessage(message, 'user');
        
        // Disable input
        this.setInputState(false);
        this.isTyping = true;
        
        // Show typing indicator
        this.addTypingIndicator();
        
        try {
            const response = await this.callChatbotAPI(message);
            
            this.removeTypingIndicator();
            this.addMessage(response.response, 'assistant');
            
            if (response.conversationId) {
                this.conversationId = response.conversationId;
            }
            
        } catch (error) {
            this.removeTypingIndicator();
            console.error('Chatbot Error:', error);
            
            let errorMessage = 'Desculpe, ocorreu um erro. Tente novamente.';
            
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                errorMessage = 'Muitas mensagens enviadas. Aguarde um momento antes de continuar.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
            }
            
            this.addMessage(errorMessage, 'assistant');
        } finally {
            this.setInputState(true);
            this.isTyping = false;
        }
    }

    async callChatbotAPI(message) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: this.conversationId
                })
            });

            if (!response.ok) {
                // Handle different error types
                if (response.status === 404) {
                    throw new Error('Chatbot API não encontrado. Verifique se o backend está rodando.');
                } else if (response.status === 429) {
                    throw new Error('Muitas mensagens enviadas. Aguarde um momento.');
                } else if (response.status >= 500) {
                    throw new Error('Erro no servidor. Tente novamente em alguns instantes.');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Erro HTTP ${response.status}`);
                }
            }

            return await response.json();
        } catch (error) {
            // Re-throw with more context if it's a network error
            if (error.message.includes('fetch') || error.name === 'TypeError') {
                throw new Error('Problema de conexão. Verifique se o backend está rodando em ' + this.apiUrl);
            }
            throw error;
        }
    }

    setInputState(enabled) {
        const input = document.getElementById('chatbotInput');
        const send = document.getElementById('chatbotSend');
        
        input.disabled = !enabled;
        send.disabled = !enabled;
        
        if (enabled) {
            input.focus();
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on pages that should have the chatbot
    const shouldShowChatbot = 
        window.location.pathname.includes('explica.html') || 
        window.location.pathname.includes('ajuda.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.includes('index.html');
    
    if (shouldShowChatbot) {
        // Determine API URL based on environment
        let apiUrl;
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDev) {
            // Local development - backend on port 3000
            apiUrl = 'http://localhost:3000/api/chatbot';
        } else {
            // Production - same domain
            apiUrl = '/api/chatbot';
        }
        
        console.log('🤖 Initializing chatbot with API:', apiUrl);
        window.sentinelaChatbot = new SentinelaChatbot(apiUrl);
    }
});
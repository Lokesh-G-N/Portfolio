// Chatbot logic using Cloud AI (Pollinations AI) so visitors don't need a local backend

class PortfolioChatbot {
  constructor() {
    this.apiUrl = 'https://text.pollinations.ai/openai';
    this.contextText = '';
    this.isOpen = false;
    this.isGenerating = false;
    this.chatHistory = [];
    
    this.init();
  }

  async init() {
    this.extractPageContext();
    this.injectHTML();
    this.attachEventListeners();
    
    const welcomeMsg = "Hi! I'm Lokesh's AI assistant. Ask me anything about his projects, skills, or experience!";
    this.addMessage(welcomeMsg, 'bot');
  }

  extractPageContext() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      this.contextText = mainContent.innerText.replace(/\n+/g, ' ').trim();
    }
  }

  injectHTML() {
    const container = document.createElement('div');
    container.className = 'chatbot-container';
    container.id = 'chatbot-container';

    container.innerHTML = `
      <div class="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-header-title">
            <i class="fas fa-robot" style="color: var(--teal-400);"></i>
            <span>AI Assistant</span>
          </div>
          <button class="chatbot-close" id="chatbot-close" aria-label="Close Chat">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chatbot-loading" id="chatbot-loading">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="chatbot-input-area">
          <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Ask about Lokesh..." autocomplete="off"/>
          <button class="chatbot-send" id="chatbot-send" aria-label="Send Message">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Toggle Chat">
        <i class="fas fa-comment-dots"></i>
      </button>
    `;

    document.body.appendChild(container);
    
    this.container = container;
    this.toggleBtn = document.getElementById('chatbot-toggle');
    this.closeBtn = document.getElementById('chatbot-close');
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.input = document.getElementById('chatbot-input');
    this.sendBtn = document.getElementById('chatbot-send');
    this.loadingIndicator = document.getElementById('chatbot-loading');
  }

  attachEventListeners() {
    this.toggleBtn.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.toggleChat());
    
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.container.classList.add('open');
      setTimeout(() => this.input.focus(), 300);
    } else {
      this.container.classList.remove('open');
    }
  }

  addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = \`chat-message \${sender}\`;
    
    let formattedText = text;
    if (sender === 'bot') {
       formattedText = formattedText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
       formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
       formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
       formattedText = formattedText.replace(/\n/g, '<br>');
    } else {
       formattedText = formattedText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    
    msgDiv.innerHTML = formattedText;
    this.messagesContainer.insertBefore(msgDiv, this.loadingIndicator);
    this.scrollToBottom();
  }

  updateBotMessage(msgDiv, text) {
    let formattedText = text;
    formattedText = formattedText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    msgDiv.innerHTML = formattedText;
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  async handleSend() {
    const text = this.input.value.trim();
    if (!text || this.isGenerating) return;

    this.input.value = '';
    this.addMessage(text, 'user');
    this.chatHistory.push({ role: 'user', content: text });
    
    this.isGenerating = true;
    this.loadingIndicator.style.display = 'block';
    this.scrollToBottom();

    try {
      const botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'chat-message bot';
      this.messagesContainer.insertBefore(botMsgDiv, this.loadingIndicator);
      
      let fullResponse = "";
      
      await this.queryAIStream(text, (chunk) => {
        if (this.loadingIndicator.style.display !== 'none') {
           this.loadingIndicator.style.display = 'none';
        }
        fullResponse += chunk;
        this.updateBotMessage(botMsgDiv, fullResponse);
      });
      
      this.chatHistory.push({ role: 'assistant', content: fullResponse });
    } catch (error) {
      console.error('Chatbot error:', error);
      this.loadingIndicator.style.display = 'none';
      
      let errorMessage = "I'm having trouble connecting to my brain. Please try again later.";
      this.addMessage(errorMessage, 'bot');
    } finally {
      this.isGenerating = false;
      this.input.focus();
    }
  }

  async queryAIStream(prompt, onChunk) {
    const systemPrompt = \`You are an AI assistant for Lokesh G N's portfolio website. 
You are very polite, helpful, and friendly. You must NEVER be commanding or rude. 
Your tone should be professional yet warm. Keep answers relatively concise.

Your primary role is to answer questions about Lokesh's projects, skills, education and experience based ONLY on the provided context.
Do NOT hallucinate or make up any information. If you don't know the answer or the information is not in the context, politely inform the user, apologize, and suggest they contact Lokesh via his email (lokeshgn2.0@gmail.com) or LinkedIn.

Here is all the text extracted from Lokesh's portfolio website to serve as your knowledge base. Read it carefully.
"""
\${this.contextText}
"""
\`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.chatHistory.slice(-5) 
    ];

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai', 
        messages: messages,
        stream: true,
        temperature: 0.1 
      }),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                onChunk(parsed.choices[0].delta.content);
              }
            } catch (e) {
              console.warn('Error parsing JSON chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioChatbot();
});

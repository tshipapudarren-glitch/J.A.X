"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Bot, User, Sparkles, Loader2, Hexagon, RefreshCw, Brain, Zap, AlertCircle } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nbjjfvzrjctsyixnhjzf.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iampmdnpyamN0c3lpeG5oanpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NDI1OTEsImV4cCI6MjExMDAxODU5MX0.tI8vtrELJ1Pmci56D8LMZRJy7Rm4Rtd6DtSDJ61KReE";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  provider?: string;
  duration?: number;
  tokens?: { input: number; output: number };
}

interface Provider {
  id: string;
  name: string;
  status: "online" | "offline" | "credits_needed";
  model: string;
  color: string;
}

const AVAILABLE_PROVIDERS: Provider[] = [
  { id: "deepseek", name: "DeepSeek V3", status: "online", model: "deepseek-chat", color: "#8b5cf6" },
  { id: "gemini", name: "Gemma 4 26B", status: "online", model: "gemma-4-26b-a4b-it", color: "#4285f4" },
  { id: "anthropic", name: "Claude (needs credits)", status: "credits_needed", model: "claude-sonnet-4-5", color: "#d4a847" },
];

const JAX_SYSTEM_PROMPT = `You are JAX-CORE, the central intelligence of the J.A.X. OMNIVERSE system. You are a highly capable AI assistant with expertise in:

- Financial markets and trading analysis (XAUUSD, Forex, Crypto, Indices)
- Software development (MQL5, Pine Script, Python, JavaScript, TypeScript)
- Research and data analysis
- Business intelligence and strategy
- System architecture and engineering

Your personality: Professional, precise, and powerful. You provide clear, actionable answers. When analyzing markets, you identify structure, liquidity, momentum, and provide both bullish and bearish scenarios. When coding, you write clean, well-documented code.

You are currently in Phase 1 of deployment. Keep responses concise but thorough. Format responses using markdown-style formatting where appropriate (use **bold** for emphasis, bullet points for lists).

Always identify yourself as JAX-CORE when relevant. Reference the J.A.X. OMNIVERSE system when discussing capabilities.`;

async function callJAXGateway(providerId: string, messages: Array<{role: string, content: string}>, system?: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/jax-gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      provider: providerId,
      payload: { messages, system: system || JAX_SYSTEM_PROMPT, max_tokens: 2048, temperature: 0.7 },
    }),
  });
  return await response.json();
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "JAX-CORE Intelligence initialized. Connected to J.A.X. Gateway via Supabase Edge Functions. Active providers: DeepSeek V3, Gemma 4 26B. How can I assist you?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeProvider, setActiveProvider] = useState("deepseek");
  const [showProviderSelect, setShowProviderSelect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const currentProvider = AVAILABLE_PROVIDERS.find(p => p.id === activeProvider) || AVAILABLE_PROVIDERS[0];

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    const userText = input;
    setInput("");
    setIsThinking(true);
    setError(null);

    // Build message history for context
    const history = messages
      .filter(m => m.role !== "system")
      .slice(-10) // Last 10 messages for context
      .map(m => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: userText });

    try {
      const result = await callJAXGateway(activeProvider, history);
      
      if (result.success) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.content || "No response generated.",
          timestamp: new Date(),
          provider: result.provider || currentProvider.name,
          duration: result.duration_ms,
          tokens: {
            input: result.input_tokens || 0,
            output: result.output_tokens || 0,
          },
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setError(result.error || "Unknown error from gateway");
        // Fallback: try alternate provider
        const fallbackId = activeProvider === "deepseek" ? "gemini" : "deepseek";
        const fallback = AVAILABLE_PROVIDERS.find(p => p.id === fallbackId);
        if (fallback && fallback.status === "online") {
          const fallbackResult = await callJAXGateway(fallbackId, history);
          if (fallbackResult.success) {
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: fallbackResult.content || "No response.",
              timestamp: new Date(),
              provider: `${fallback.name} (fallback)`,
              duration: fallbackResult.duration_ms,
              tokens: { input: fallbackResult.input_tokens || 0, output: fallbackResult.output_tokens || 0 },
            }]);
            setError(null);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const suggestedPrompts = [
    { text: "Analyse gold (XAUUSD) for me", icon: "📊" },
    { text: "What is the current US GDP and inflation trend?", icon: "📈" },
    { text: "Write an MQL5 moving average crossover EA", icon: "⚙️" },
    { text: "Explain smart money concepts", icon: "💡" },
    { text: "Create a Pine Script RSI divergence indicator", icon: "📉" },
    { text: "What are the key risk factors for my portfolio?", icon: "🛡️" },
  ];

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={i}>
            {parts.map((part, j) => 
              j % 2 === 1 
                ? <strong key={j} style={{ color: "#d4a847" }}>{part}</strong>
                : <span key={j}>{part}</span>
            )}
          </div>
        );
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <div key={i} className="ml-4 text-xs" style={{ color: "#a0a0a0" }}>• {line.substring(2)}</div>;
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        return <div key={i} className="ml-4 text-xs" style={{ color: "#a0a0a0" }}>{line}</div>;
      }
      // Headers
      if (line.startsWith('### ')) {
        return <div key={i} className="font-bold mt-2 text-sm" style={{ color: "#d4a847" }}>{line.substring(4)}</div>;
      }
      if (line.startsWith('## ')) {
        return <div key={i} className="font-bold mt-3 text-sm" style={{ color: "#d4a847" }}>{line.substring(3)}</div>;
      }
      // Empty lines
      if (line.trim() === '') return <br key={i} />;
      return <span key={i}>{line}<br /></span>;
    });
  };

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: "calc(100vh - 120px)" }}>
      {/* Chat Header */}
      <div className="jax-glass p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center jax-border-animate" style={{ background: "rgba(212, 168, 71, 0.1)", border: "1px solid rgba(212, 168, 71, 0.3)" }}>
              <Hexagon size={20} style={{ color: "#d4a847" }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: "#e0e0e0" }}>JAX-CORE Intelligence</div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#808080" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: currentProvider.status === "online" ? "#00d97e" : "#f59e0b" }} />
                <span>via {currentProvider.name}</span>
                <span style={{ color: "#606060" }}>•</span>
                <span>Gateway: Supabase Edge</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Provider Selector */}
            <div className="relative">
              <button
                onClick={() => setShowProviderSelect(!showProviderSelect)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ 
                  background: `${currentProvider.color}15`, 
                  border: `1px solid ${currentProvider.color}30`,
                  color: currentProvider.color,
                }}
              >
                <Brain size={12} />
                {currentProvider.name.split(' ')[0]}
              </button>
              {showProviderSelect && (
                <div className="absolute right-0 top-full mt-1 z-50 rounded-lg overflow-hidden" style={{ background: "#1a1a2e", border: "1px solid rgba(212,168,71,0.2)", minWidth: "200px" }}>
                  {AVAILABLE_PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { if (p.status === "online") { setActiveProvider(p.id); setShowProviderSelect(false); } }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs transition-all hover:bg-white/5"
                      style={{ opacity: p.status === "online" ? 1 : 0.5 }}
                      disabled={p.status !== "online"}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.status === "online" ? "#00d97e" : p.status === "credits_needed" ? "#f59e0b" : "#c41e3a" }} />
                        <span style={{ color: p.id === activeProvider ? p.color : "#c0c0c0" }}>{p.name}</span>
                      </div>
                      {p.id === activeProvider && <span style={{ color: p.color }}>●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="jax-badge jax-badge-green">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00d97e" }} />
              Live
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
              background: msg.role === "user" 
                ? "linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.05))" 
                : msg.role === "system" ? "rgba(212, 168, 71, 0.1)" : "linear-gradient(135deg, rgba(212, 168, 71, 0.2), rgba(212, 168, 71, 0.05))",
              border: `1px solid ${msg.role === "user" ? "rgba(192, 192, 192, 0.2)" : msg.role === "system" ? "rgba(212, 168, 71, 0.15)" : "rgba(212, 168, 71, 0.3)"}`
            }}>
              {msg.role === "user" ? <User size={14} style={{ color: "#c0c0c0" }} /> : 
               msg.role === "system" ? <Sparkles size={14} style={{ color: "#d4a847" }} /> :
               <Bot size={14} style={{ color: "#d4a847" }} />}
            </div>
            <div className="max-w-[80%] rounded-xl px-4 py-3" style={{
              background: msg.role === "user" 
                ? "rgba(192, 192, 192, 0.08)" 
                : msg.role === "system" ? "rgba(212, 168, 71, 0.05)" : "rgba(26, 26, 46, 0.6)",
              border: `1px solid ${msg.role === "user" ? "rgba(192, 192, 192, 0.1)" : msg.role === "system" ? "rgba(212, 168, 71, 0.15)" : "rgba(212, 168, 71, 0.08)"}`
            }}>
              <div className="text-sm leading-relaxed" style={{ color: "#c0c0c0" }}>
                {formatContent(msg.content)}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px]" style={{ color: "#606060" }}>
                  {msg.timestamp.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.provider && (
                  <span className="text-[10px]" style={{ color: "#606060" }}>
                    via {msg.provider}
                  </span>
                )}
                {msg.duration && (
                  <span className="text-[10px]" style={{ color: "#606060" }}>
                    {msg.duration}ms
                  </span>
                )}
                {msg.tokens && (
                  <span className="text-[10px]" style={{ color: "#606060" }}>
                    {msg.tokens.input + msg.tokens.output} tokens
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(212, 168, 71, 0.1)", border: "1px solid rgba(212, 168, 71, 0.3)" }}>
              <Bot size={14} style={{ color: "#d4a847" }} />
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(26, 26, 46, 0.6)", border: "1px solid rgba(212, 168, 71, 0.08)" }}>
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" style={{ color: "#d4a847" }} />
                <span className="text-xs" style={{ color: "#808080" }}>
                  JAX-CORE thinking via {currentProvider.name}...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-2 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: "rgba(196, 30, 58, 0.1)", border: "1px solid rgba(196, 30, 58, 0.2)" }}>
          <AlertCircle size={12} style={{ color: "#ff4d6a" }} />
          <span className="text-xs" style={{ color: "#ff4d6a" }}>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-xs" style={{ color: "#808080" }}>×</button>
        </div>
      )}

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <div className="text-xs font-medium mb-2" style={{ color: "#808080" }}>SUGGESTED COMMANDS</div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => setInput(prompt.text)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105 flex items-center gap-1.5"
                style={{ background: "rgba(212, 168, 71, 0.08)", border: "1px solid rgba(212, 168, 71, 0.15)", color: "#d4a847" }}
              >
                <span>{prompt.icon}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="jax-glass p-3">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#808080" }} title="Voice input (Phase 12)">
            <Mic size={18} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Speak to J.A.X. or type a command..."
            className="jax-input flex-1"
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="jax-btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px]" style={{ color: "#606060" }}>
            Gateway: jax-gateway@supabase • Provider: {currentProvider.name}
          </span>
          <span className="text-[10px]" style={{ color: "#606060" }}>
            {messages.filter(m => m.role === "assistant").length} responses
          </span>
        </div>
      </div>
    </div>
  );
}

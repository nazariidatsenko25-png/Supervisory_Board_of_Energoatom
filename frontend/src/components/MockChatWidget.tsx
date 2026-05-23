'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/agentStore';

export default function MockChatWidget({ agentId }: { agentId?: string }) {
  const [isOpen, setIsOpen] = useState(!!agentId);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const getAgentConfig = useStore(state => state.getAgentConfig);
  const getWorkflowConfig = useStore(state => state.getWorkflowConfig);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let url = 'http://127.0.0.1:8000/api/chat/stream';
      let payload;

      if (agentId) {
        payload = {
          agent_id: agentId,
          message: userMessage,
          session_id: null
        };
      } else {
        // Check if this is a multi-step workflow
        const workflowConfig = getWorkflowConfig();
        if (workflowConfig.mode === 'workflow') {
          url = 'http://127.0.0.1:8000/api/workflow/stream';
          payload = {
            steps: workflowConfig.steps,
            message: userMessage
          };
        } else {
          // Single agent mode (backward compat)
          const config = workflowConfig.singleConfig || getAgentConfig();
          payload = {
            ...config,
            message: userMessage
          };
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          let eolIndex;
          while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
            const chunk = buffer.slice(0, eolIndex).trim();
            buffer = buffer.slice(eolIndex + 2);
            
            if (chunk.startsWith('data: ')) {
              const dataStr = chunk.slice(6);
              try {
                const data = JSON.parse(dataStr);
                setMessages(prev => [...prev, data]);
              } catch (e) {
                console.error('Failed to parse JSON chunk:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      setMessages(prev => [...prev, { type: 'message', content: 'Помилка підключення до сервера.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (msg: any, index: number) => {
    switch (msg.type) {
      case 'user':
        return (
          <div key={index} className="flex justify-end mb-3">
            <div className="bg-[var(--accent)] text-[var(--text-inverse)] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        );
      case 'status':
        return (
          <div key={index} className="mb-2 text-center animate-fade-in">
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono-brand">{msg.content}</span>
          </div>
        );
      case 'step_start':
        return (
          <div key={index} className="mb-3 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent)] border-opacity-30">
              <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-[var(--text-inverse)]">
                {(msg.step_index ?? 0) + 1}
              </div>
              <span className="text-xs font-semibold text-[var(--accent)]">
                Крок {(msg.step_index ?? 0) + 1}/{msg.total_steps}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] truncate flex-1">
                {msg.step_label}
              </span>
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
            </div>
          </div>
        );
      case 'step_end':
        return (
          <div key={index} className="mb-3 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(52,211,153,0.08)] border border-[var(--success)] border-opacity-20">
              <span className="text-[10px] text-[var(--success)] font-mono-brand font-semibold">
                ✓ Крок {(msg.step_index ?? 0) + 1} завершено
              </span>
            </div>
          </div>
        );
      case 'thought':
        return (
          <div key={index} className="flex justify-start mb-2 animate-fade-in">
            <div className="max-w-[90%] bg-[var(--bg-elevated)] rounded-lg px-3 py-2 text-xs border border-[var(--border)]">
              <div className="flex items-center gap-1.5 mb-1 text-[var(--accent)] font-mono-brand text-[10px] uppercase tracking-wider font-semibold">
                <span>🧠</span>
                Thinking
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">{msg.content}</p>
            </div>
          </div>
        );
      case 'action':
        return (
          <div key={index} className="flex justify-start mb-2 animate-fade-in">
            <div className="flex flex-col gap-1.5 bg-[var(--bg-elevated)] rounded-lg px-3 py-2 text-xs border border-[var(--accent)] border-opacity-30 w-full max-w-[90%]">
              <div className="font-semibold flex items-center gap-1.5 text-[var(--accent)] font-mono-brand">
                <span className="text-[10px]">▶</span>
                {msg.tool}
              </div>
              <pre className="overflow-x-auto text-[10px] text-[var(--text-secondary)] bg-[var(--bg-primary)] p-1.5 rounded font-mono-brand">{JSON.stringify(msg.args, null, 2)}</pre>
            </div>
          </div>
        );
      case 'observation':
        return (
          <div key={index} className="flex justify-start mb-2 animate-fade-in">
             <div className="bg-[var(--bg-elevated)] rounded-lg px-3 py-2 text-xs border border-[var(--border)] w-full max-w-[90%]">
                <div className="font-semibold mb-1 flex items-center gap-1.5 text-[var(--warning)] font-mono-brand text-[10px] uppercase tracking-wider">
                  <span>◉</span>
                  Observation
                </div>
                <div className="line-clamp-4 text-[11px] leading-relaxed text-[var(--text-secondary)]">{msg.content}</div>
             </div>
          </div>
        );
      case 'message':
      default:
        return (
          <div key={index} className="flex justify-start mb-3">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* FAB Toggle */}
      {!agentId && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 w-14 h-14 bg-[var(--accent)] rounded-full shadow-[0_0_30px_var(--accent-glow-strong)] flex items-center justify-center text-[var(--text-inverse)] hover:scale-110 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      <div 
        className={agentId 
          ? `w-full h-screen bg-[var(--bg-primary)] flex flex-col overflow-hidden`
          : `fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] bg-[var(--bg-primary)] rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 border border-[var(--border)] ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-3 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">Agentic AI</h3>
              <p className="text-[10px] text-[var(--text-tertiary)] font-mono-brand">ReAct Live Tracking</p>
            </div>
          </div>
          {!agentId && (
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <p className="text-sm text-[var(--text-tertiary)] max-w-[200px]">Поставте запитання — я використаю інструменти для відповіді.</p>
            </div>
          ) : (
            messages.map((msg, index) => renderMessageContent(msg, index))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border)] z-10">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введіть повідомлення..."
              className="w-full pl-4 pr-12 py-3 bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] rounded-xl text-sm transition-all outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 text-[var(--accent)] disabled:text-[var(--text-tertiary)] hover:bg-[var(--accent-glow)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 -rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

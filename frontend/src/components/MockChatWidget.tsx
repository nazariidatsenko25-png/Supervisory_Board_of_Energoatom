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
      let payload;
      if (agentId) {
        payload = {
          agent_id: agentId,
          message: userMessage,
          session_id: null
        };
      } else {
        const config = getAgentConfig();
        payload = {
          ...config,
          message: userMessage
        };
      }

      const response = await fetch('http://localhost:8000/api/chat/stream', {
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
          <div key={index} className="flex justify-end mb-4">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm">
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        );
      case 'thought':
        return (
          <div key={index} className="flex justify-start mb-2">
            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 text-xs border border-gray-100">
              <svg className="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="italic">{msg.content}</span>
            </div>
          </div>
        );
      case 'action':
        return (
          <div key={index} className="flex justify-start mb-2">
            <div className="flex flex-col gap-1 bg-emerald-50 text-emerald-800 rounded-lg px-3 py-2 text-xs border border-emerald-100 w-full max-w-[90%] shadow-sm">
              <div className="font-semibold flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Виклик інструменту: {msg.tool}
              </div>
              <pre className="overflow-x-auto text-[10px] bg-emerald-100/50 p-1.5 rounded">{JSON.stringify(msg.args, null, 2)}</pre>
            </div>
          </div>
        );
      case 'observation':
        return (
          <div key={index} className="flex justify-start mb-2">
             <div className="bg-purple-50 text-purple-800 rounded-lg px-3 py-2 text-xs border border-purple-100 w-full max-w-[90%] shadow-sm">
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  Результат (Observation):
                </div>
                <div className="line-clamp-3 text-[11px] leading-tight opacity-90">{msg.content}</div>
             </div>
          </div>
        );
      case 'message':
      default:
        return (
          <div key={index} className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] shadow-sm">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {!agentId && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 transition-transform z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      <div 
        className={agentId 
          ? `w-full h-screen bg-gray-50 flex flex-col overflow-hidden`
          : `fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 border border-gray-100 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-white border-b px-5 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Agentic AI</h3>
              <p className="text-[10px] text-gray-500 font-medium">ReAct Live Tracking</p>
            </div>
          </div>
          {!agentId && (
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
               </div>
               <p className="text-sm text-gray-600 max-w-[200px]">Привіт! Поставте запитання і я використаю налаштовані інструменти для відповіді.</p>
            </div>
          ) : (
            messages.map((msg, index) => renderMessageContent(msg, index))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t z-10">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введіть ваше повідомлення..."
              className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm transition-all outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 text-blue-600 disabled:text-gray-400 hover:bg-blue-50 rounded-lg transition-colors"
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

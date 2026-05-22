'use client';

import { useState, useEffect } from 'react';

export default function MockChatWidget() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const startStream = async () => {
    setLoading(true);
    setMessages([]);
    try {
      const response = await fetch('http://localhost:8000/api/chat/stream');
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden flex flex-col">
      <div className="bg-blue-600 text-white p-4 font-semibold">
        Agentic Studio Live
      </div>
      
      <div className="flex-1 p-4 h-96 overflow-y-auto bg-gray-50 flex flex-col gap-2 text-sm text-gray-800">
        {messages.length === 0 && !loading && (
          <div className="text-gray-500 italic text-center mt-4">Натисніть кнопку, щоб розпочати тест SSE.</div>
        )}
        
        {messages.map((msg, idx) => {
          if (msg.type === 'thought') {
            return <div key={idx} className="text-gray-500 italic font-mono bg-gray-100 p-2 rounded">THOUGHT: {msg.content}</div>;
          }
          if (msg.type === 'action') {
            return (
              <div key={idx} className="bg-blue-50 border border-blue-200 p-2 rounded text-blue-800 font-mono">
                ACTION: {msg.tool}({JSON.stringify(msg.args)})
              </div>
            );
          }
          if (msg.type === 'observation') {
            return <div key={idx} className="text-green-600 italic font-mono bg-green-50 p-2 rounded">OBSERVATION: {msg.content}</div>;
          }
          return <div key={idx} className="bg-white p-3 rounded shadow-sm border border-gray-100">{msg.content}</div>;
        })}
        {loading && <div className="text-gray-400 italic">Стримінг...</div>}
      </div>
      
      <div className="p-3 bg-white border-t border-gray-200">
        <button 
          onClick={startStream}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Йде стримінг...' : 'Почати тест SSE'}
        </button>
      </div>
    </div>
  );
}

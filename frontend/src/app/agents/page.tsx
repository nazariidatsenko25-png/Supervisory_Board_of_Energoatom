'use client';

import { useState, useEffect } from 'react';

type Agent = {
  id: string;
  name: string;
  system_prompt: string;
  tools: string[];
  max_iterations: number;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [embedModal, setEmbedModal] = useState<string | null>(null);
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (e) {
      console.error('Failed to fetch agents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити цього агента?')) return;
    try {
      await fetch(`http://localhost:8000/api/agents/${id}`, { method: 'DELETE' });
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const getEmbedCode = (id: string) => {
    return `<script src="http://localhost:3000/embed.js" data-agent="${id}" defer></script>`;
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !chatAgentId) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: chatAgentId, message: userMessage })
      });

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
              try {
                const data = JSON.parse(chunk.slice(6));
                setChatMessages(prev => [...prev, data]);
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'message', content: 'Помилка підключення.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderMsg = (msg: any, i: number) => {
    if (msg.type === 'user') return (
      <div key={i} className="flex justify-end mb-2">
        <div className="bg-[var(--accent)] text-[var(--text-inverse)] rounded-xl px-3 py-2 max-w-[80%] text-sm">{msg.content}</div>
      </div>
    );
    if (msg.type === 'thought') return (
      <div key={i} className="mb-1.5">
        <div className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-elevated)] rounded-lg px-3 py-1.5 border border-[var(--border)] inline-flex items-center gap-1.5">
          <span className="text-[var(--accent)]">🧠</span>
          <span className="italic font-mono-brand">{msg.content}</span>
        </div>
      </div>
    );
    if (msg.type === 'action') return (
      <div key={i} className="mb-1.5">
        <div className="text-xs bg-[var(--bg-elevated)] rounded-lg px-3 py-2 border border-[var(--accent)] border-opacity-30 inline-block">
          <span className="text-[var(--accent)] font-mono-brand font-semibold">▶ {msg.tool}</span>
          <pre className="text-[10px] text-[var(--text-tertiary)] mt-1">{JSON.stringify(msg.args)}</pre>
        </div>
      </div>
    );
    if (msg.type === 'observation') return (
      <div key={i} className="mb-1.5">
        <div className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-elevated)] rounded-lg px-3 py-2 border border-[var(--border)] max-w-[90%]">
          <span className="text-[var(--warning)] font-mono-brand text-[10px] uppercase tracking-wider">◉ Observation</span>
          <p className="mt-1 line-clamp-3">{msg.content}</p>
        </div>
      </div>
    );
    if (msg.type === 'status') return (
      <div key={i} className="mb-1 text-center">
        <span className="text-[10px] text-[var(--text-tertiary)] font-mono-brand">{msg.content}</span>
      </div>
    );
    if (msg.type === 'message') return (
      <div key={i} className="flex justify-start mb-2">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 max-w-[85%] text-sm text-[var(--text-primary)] whitespace-pre-wrap">{msg.content}</div>
      </div>
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-display text-lg hover:text-[var(--accent)] transition-colors">Agentic Studio</a>
            <div className="w-px h-5 bg-[var(--border)]"></div>
            <h1 className="text-sm font-semibold">My Agents</h1>
          </div>
          <a href="/builder" className="px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
            + New Agent
          </a>
        </div>
      </header>

      {/* Agent List */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[var(--text-tertiary)]">Завантаження агентів...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-4 text-2xl">🤖</div>
            <h2 className="text-xl font-semibold mb-2">Ще немає агентів</h2>
            <p className="text-[var(--text-tertiary)] mb-6 text-sm">Створіть першого агента у візуальному конструкторі</p>
            <a href="/builder" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--text-inverse)] rounded-lg text-sm font-semibold">
              Open Builder →
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--text-tertiary)] transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">{agent.name || 'Unnamed Agent'}</h3>
                      <span className="text-[10px] font-mono-brand text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded">
                        {agent.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                      {agent.system_prompt || '—'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                      {agent.tools?.length > 0 && (
                        <span className="flex items-center gap-1">
                          🛠 {agent.tools.join(', ')}
                        </span>
                      )}
                      <span>⚙ max {agent.max_iterations} steps</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setChatAgentId(agent.id); setChatMessages([]); }}
                      className="px-3 py-1.5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-lg text-xs font-semibold hover:bg-[var(--accent)] hover:text-[var(--text-inverse)] transition-all"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => setEmbedModal(agent.id)}
                      className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-xs font-medium hover:border-[var(--text-tertiary)] transition-colors"
                    >
                      Embed
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="px-3 py-1.5 border border-[var(--border)] text-[var(--error)] rounded-lg text-xs font-medium hover:bg-[var(--error)] hover:text-white hover:border-[var(--error)] transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embed Modal */}
      {embedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setEmbedModal(null)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl w-full max-w-lg overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm">Embed Code</h2>
              <button onClick={() => setEmbedModal(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">✕</button>
            </div>
            <div className="p-5">
              <p className="text-xs text-[var(--text-secondary)] mb-3">Вставте цей код перед <code className="text-[var(--accent)] font-mono-brand">&lt;/body&gt;</code>:</p>
              <pre className="bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--accent)] p-3 rounded-lg font-mono-brand text-xs overflow-x-auto">
                {getEmbedCode(embedModal)}
              </pre>
              <button
                onClick={() => { navigator.clipboard.writeText(getEmbedCode(embedModal)); }}
                className="mt-3 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] rounded-lg text-xs font-semibold w-full hover:brightness-110 transition-all"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel (slides in from right) */}
      {chatAgentId && (
        <div className="fixed inset-y-0 right-0 w-[420px] max-w-full bg-[var(--bg-secondary)] border-l border-[var(--border)] z-40 flex flex-col animate-slide-in-right shadow-2xl shadow-black/40">
          {/* Chat header */}
          <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Agent Chat</span>
              <span className="text-[10px] font-mono-brand text-[var(--text-tertiary)]">{chatAgentId.slice(0, 8)}</span>
            </div>
            <button onClick={() => setChatAgentId(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[var(--text-tertiary)]">Задайте питання агенту...</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => renderMsg(msg, i))
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border)] p-3">
            <form onSubmit={handleChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Повідомлення..."
                disabled={chatLoading}
                className="flex-1 px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent)] rounded-lg text-sm outline-none transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2.5 bg-[var(--accent)] text-[var(--text-inverse)] rounded-lg text-sm font-semibold disabled:opacity-40 hover:brightness-110 transition-all"
              >
                →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

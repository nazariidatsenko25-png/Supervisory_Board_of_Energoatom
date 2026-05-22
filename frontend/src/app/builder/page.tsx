'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/store/agentStore';
import { PromptNode } from '@/components/nodes/PromptNode';
import { ToolNode } from '@/components/nodes/ToolNode';
import { GuardrailNode } from '@/components/nodes/GuardrailNode';

export default function BuilderPage() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, getAgentConfig } = useStore();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');

  const nodeTypes = useMemo(() => ({
    prompt: PromptNode,
    tool: ToolNode,
    guardrail: GuardrailNode,
  }), []);

  const handleDeploy = async () => {
    const config = getAgentConfig();
    setIsDeploying(true);
    try {
      const res = await fetch('http://localhost:8000/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!res.ok) {
        throw new Error('Failed to deploy agent');
      }
      
      const data = await res.json();
      setGeneratedScript(`<script src="http://localhost:3000/embed.js" data-agent="${data.agent_id}" defer></script>`);
      setShowSuccessModal(true);
    } catch (e) {
      console.error(e);
      alert('Error deploying agent. Is the backend running at port 8000?');
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <a href="/" className="font-display text-lg text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
            Agentic Studio
          </a>
          <div className="w-px h-5 bg-[var(--border)]"></div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">Builder</h1>
            <p className="text-xs text-[var(--text-tertiary)]">Складіть логіку вашого агента</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="px-5 py-2 bg-[var(--accent)] hover:brightness-110 disabled:opacity-50 text-[var(--text-inverse)] rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_24px_var(--accent-glow-strong)] flex items-center gap-2"
          >
            {isDeploying ? 'Deploying...' : 'Deploy Agent →'}
          </button>
          <a 
            href="/"
            className="px-4 py-2 border border-[var(--border)] hover:border-[var(--text-tertiary)] text-[var(--text-secondary)] rounded-lg text-sm font-medium transition-colors"
          >
            Preview
          </a>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[var(--bg-primary)]"
        >
          <Background color="#2A2A2E" gap={20} size={1} />
          <Controls 
            className="!bg-[var(--bg-secondary)] !border-[var(--border)] !rounded-xl !shadow-2xl [&>button]:!bg-[var(--bg-secondary)] [&>button]:!border-[var(--border)] [&>button]:!text-[var(--text-secondary)] [&>button:hover]:!bg-[var(--bg-elevated)]" 
          />
          <MiniMap 
            nodeStrokeWidth={3} 
            className="!rounded-xl !shadow-2xl !border-[var(--border)] !bg-[var(--bg-secondary)]" 
            maskColor="rgba(12, 12, 14, 0.8)"
          />
        </ReactFlow>

        {/* Deploy Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
              {/* Modal header */}
              <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
                    <span className="text-[var(--accent)]">✓</span>
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Agent Deployed</h2>
                </div>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <p className="text-[var(--text-secondary)] mb-4 text-sm">
                  Додайте цей сніпет перед <code className="font-mono-brand text-[var(--accent)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">&lt;/body&gt;</code>:
                </p>
                <div className="relative group">
                  <pre className="bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--accent)] p-4 rounded-xl overflow-x-auto font-mono-brand text-sm">
                    {generatedScript}
                  </pre>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 bg-[var(--bg-elevated)] hover:bg-[var(--border-light)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[var(--border)]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
    alert('Copied to clipboard!');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-900 to-purple-800 border-b px-6 py-4 flex items-center justify-between shadow-md z-10">
        <div>
          <h1 className="text-xl font-bold text-white">Agentic Studio Builder</h1>
          <p className="text-sm text-indigo-200">Складіть логіку вашого агента за допомогою блоків</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
          >
            {isDeploying ? 'Deploying...' : 'Save & Deploy 🚀'}
          </button>
          <a 
            href="/"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm font-medium transition-colors shadow-sm backdrop-blur-sm flex items-center gap-2"
          >
            Тестувати Віджет &rarr;
          </a>
        </div>
      </header>

      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
        >
          <Background color="#ccc" gap={16} />
          <Controls className="bg-white shadow-lg border-none rounded-xl overflow-hidden" />
          <MiniMap nodeStrokeWidth={3} className="rounded-xl shadow-lg border-none" />
        </ReactFlow>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  🎉 Успішно розгорнуто!
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4 text-lg">
                  Ваш агент готовий до роботи. Додайте цей скрипт на ваш сайт перед закриваючим тегом <code>&lt;/body&gt;</code>:
                </p>
                <div className="relative group">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto font-mono text-sm shadow-inner border border-gray-800">
                    {generatedScript}
                  </pre>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-md transition-colors"
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
                  >
                    Закрити
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

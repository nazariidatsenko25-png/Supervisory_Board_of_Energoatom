'use client';

import { useCallback, useMemo, useState, useRef, DragEvent, MouseEvent } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/store/agentStore';
import { PromptNode } from '@/components/nodes/PromptNode';
import { ToolNode } from '@/components/nodes/ToolNode';
import { GuardrailNode } from '@/components/nodes/GuardrailNode';
import { KnowledgeNode } from '@/components/nodes/KnowledgeNode';
import { OutputNode } from '@/components/nodes/OutputNode';
import { ConditionNode } from '@/components/nodes/ConditionNode';
import { ApiNode } from '@/components/nodes/ApiNode';
import { MemoryNode } from '@/components/nodes/MemoryNode';
import { NodeSidebar } from '@/components/NodeSidebar';

export default function BuilderPage() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, getAgentConfig, addNode, removeNode } = useStore();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [agentName, setAgentName] = useState('');
  const [deployedAgentId, setDeployedAgentId] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({
    prompt: PromptNode,
    tool: ToolNode,
    guardrail: GuardrailNode,
    knowledge: KnowledgeNode,
    output: OutputNode,
    condition: ConditionNode,
    api: ApiNode,
    memory: MemoryNode,
  }), []);

  // ─── Drag & Drop from Sidebar ───
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type');
      const dataStr = event.dataTransfer.getData('application/reactflow-data');

      if (!type || !rfInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      let data = {};
      try {
        data = JSON.parse(dataStr);
      } catch {}

      addNode(type, position, data);
    },
    [rfInstance, addNode]
  );

  // ─── Context Menu (Right-click) ───
  const onNodeContextMenu = useCallback(
    (event: MouseEvent, node: any) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (contextMenu) {
      removeNode(contextMenu.nodeId);
      setContextMenu(null);
    }
  }, [contextMenu, removeNode]);

  // ─── Deploy ───
  const handleDeploy = async () => {
    const config = getAgentConfig();
    setIsDeploying(true);
    try {
      const res = await fetch('http://localhost:8000/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName || 'Unnamed Agent',
          ...config
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to deploy agent');
      }
      
      const data = await res.json();
      setDeployedAgentId(data.agent_id);
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
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <a href="/" className="font-display text-lg text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
            Agentic Studio
          </a>
          <div className="w-px h-5 bg-[var(--border)]"></div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Agent name..."
              className="bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none py-1 px-1 w-48 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <a 
            href="/agents"
            className="px-3 py-1.5 text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors"
          >
            My Agents
          </a>
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="px-5 py-2 bg-[var(--accent)] hover:brightness-110 disabled:opacity-50 text-[var(--text-inverse)] rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_24px_var(--accent-glow-strong)] flex items-center gap-2"
          >
            {isDeploying ? 'Deploying...' : 'Save & Deploy →'}
          </button>
        </div>
      </header>

      {/* Main area: Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <NodeSidebar />

        {/* Canvas */}
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[var(--bg-primary)]"
            deleteKeyCode={['Backspace', 'Delete']}
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

          {/* Context Menu */}
          {contextMenu && (
            <div
              className="fixed z-50 animate-fade-in"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                <button
                  onClick={handleDeleteNode}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[var(--error)] hover:bg-[rgba(248,113,113,0.1)] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Видалити блок
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Agent Deployed</h2>
                  <p className="text-xs text-[var(--text-tertiary)] font-mono-brand">{deployedAgentId.slice(0, 8)}...</p>
                </div>
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
              <div className="mt-6 flex gap-3 justify-end">
                <a
                  href="/agents"
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
                >
                  View All Agents →
                </a>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:border-[var(--text-tertiary)] transition-colors"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

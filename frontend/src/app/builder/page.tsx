'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/store/agentStore';
import { PromptNode } from '@/components/nodes/PromptNode';
import { ToolNode } from '@/components/nodes/ToolNode';
import { GuardrailNode } from '@/components/nodes/GuardrailNode';

export default function BuilderPage() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, getAgentConfig } = useStore();

  const nodeTypes = useMemo(() => ({
    prompt: PromptNode,
    tool: ToolNode,
    guardrail: GuardrailNode,
  }), []);

  const handleExport = useCallback(() => {
    const config = getAgentConfig();
    alert(JSON.stringify(config, null, 2));
  }, [getAgentConfig]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Agentic Studio Builder</h1>
          <p className="text-sm text-gray-500">Складіть логіку вашого агента за допомогою блоків</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border"
          >
            Переглянути JSON Конфіг
          </button>
          <a 
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Тестувати Віджет &rarr;
          </a>
        </div>
      </header>

      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background color="#ccc" gap={16} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} />
        </ReactFlow>
      </div>
    </div>
  );
}

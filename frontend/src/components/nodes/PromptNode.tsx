import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function PromptNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="relative bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-visible min-w-[320px] transition-all hover:border-[var(--node-prompt)] hover:shadow-[0_0_24px_var(--node-prompt-glow)]">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'var(--node-prompt-glow)' }}>
          📝
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Системний Промпт</span>
      </div>
      <div className="p-4">
        <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Інструкції для агента</label>
        <textarea
          className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm h-28 focus:ring-1 focus:ring-[var(--node-prompt)] focus:border-[var(--node-prompt)] outline-none resize-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          placeholder="Ти корисний асистент..."
          value={data.system_prompt || ''}
          onChange={(e) => updateNodeData(id, { system_prompt: e.target.value })}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-[var(--node-prompt)] !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5" />
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';

export function PromptNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden min-w-[320px] transition-all hover:border-[var(--accent)] hover:shadow-[0_0_24px_var(--accent-glow)]">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <span className="text-base">📝</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Системний Промпт</span>
      </div>
      <div className="p-4">
        <label className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Інструкції для агента</label>
        <textarea
          className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm h-28 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none resize-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          placeholder="Ти корисний асистент..."
          value={data.system_prompt || ''}
          onChange={(e) => updateNodeData(id, { system_prompt: e.target.value })}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-[var(--accent)] !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5" />
    </div>
  );
}

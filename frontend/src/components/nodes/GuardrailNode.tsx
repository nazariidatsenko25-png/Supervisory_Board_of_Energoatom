import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';

export function GuardrailNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden min-w-[280px] transition-all hover:border-[var(--warning)] hover:shadow-[0_0_24px_rgba(251,191,36,0.15)]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-[var(--warning)] !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5" />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <span className="text-base">🛡️</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Обмеження</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Макс. ітерацій
          </label>
          <span className="bg-[rgba(251,191,36,0.15)] text-[var(--warning)] font-mono-brand font-semibold px-2.5 py-1 rounded-md text-sm">
            {data.max_iterations || 5}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="15"
          step="1"
          value={data.max_iterations || 5}
          onChange={(e) => updateNodeData(id, { max_iterations: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--warning)]"
        />
        <p className="text-[10px] text-[var(--text-tertiary)] mt-3 flex items-start gap-1.5 leading-relaxed">
          <span className="text-[var(--warning)]">⚠</span>
          Запобігає безкінечним циклам (вигорянню токенів).
        </p>
      </div>
    </div>
  );
}

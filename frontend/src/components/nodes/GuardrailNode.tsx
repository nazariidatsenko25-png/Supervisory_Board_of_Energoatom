import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function GuardrailNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="relative bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-visible min-w-[280px] transition-all hover:border-[var(--node-guardrail)] hover:shadow-[0_0_24px_var(--node-guardrail-glow)]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5" style={{ background: 'var(--node-guardrail)' }} />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'var(--node-guardrail-glow)' }}>
          🛡️
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Обмеження</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Макс. ітерацій
          </label>
          <span className="font-mono-brand font-semibold px-2.5 py-1 rounded-md text-sm" style={{ background: 'var(--node-guardrail-glow)', color: 'var(--node-guardrail)' }}>
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
          className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: 'var(--node-guardrail)' }}
        />
        <p className="text-[10px] text-[var(--text-tertiary)] mt-3 flex items-start gap-1.5 leading-relaxed">
          <span style={{ color: 'var(--node-guardrail)' }}>⚠</span>
          Запобігає безкінечним циклам (вигорянню токенів).
        </p>
      </div>
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

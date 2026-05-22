import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function ConditionNode({ id, data }: { id: string; data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div
      className="relative bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-visible min-w-[280px] transition-all hover:shadow-[0_0_24px_var(--node-condition-glow)]"
      style={{ borderColor: data.expression ? 'var(--node-condition)' : undefined }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5"
        style={{ background: 'var(--node-condition)' }}
      />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--node-condition-glow)' }}
        >
          🔀
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Condition</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            Вираз умови
          </label>
          <input
            type="text"
            className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs focus:ring-1 focus:ring-[var(--node-condition)] focus:border-[var(--node-condition)] outline-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-mono-brand"
            placeholder="contains(response, 'error')"
            value={data.expression || ''}
            onChange={(e) => updateNodeData(id, { expression: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium"
            style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
            {data.true_label || 'True'}
          </div>
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium"
            style={{ background: 'rgba(248, 113, 113, 0.1)', color: 'var(--error)' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--error)' }} />
            {data.false_label || 'False'}
          </div>
        </div>
      </div>
      {/* Two source handles: left = true, right = false */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5"
        style={{ background: 'var(--success)', left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5"
        style={{ background: 'var(--error)', left: '70%' }}
      />
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

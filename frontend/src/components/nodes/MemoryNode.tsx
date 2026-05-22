import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function MemoryNode({ id, data }: { id: string; data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div
      className="relative bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-visible min-w-[260px] transition-all hover:shadow-[0_0_24px_var(--node-memory-glow)]"
      style={{ borderColor: 'var(--node-memory)' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5"
        style={{ background: 'var(--node-memory)' }}
      />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--node-memory-glow)' }}
        >
          🧠
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Memory</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            Тип пам'яті
          </label>
          <div className="flex gap-1.5">
            {(['session', 'persistent'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateNodeData(id, { memory_type: t })}
                className="flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all text-center"
                style={{
                  background: data.memory_type === t ? 'var(--node-memory-glow)' : 'var(--bg-elevated)',
                  color: data.memory_type === t ? 'var(--node-memory)' : 'var(--text-tertiary)',
                  border: `1px solid ${data.memory_type === t ? 'var(--node-memory)' : 'var(--border)'}`,
                }}
              >
                {t === 'session' ? '⏱ Session' : '💿 Persistent'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              TTL (хвилини)
            </label>
            <span
              className="font-mono-brand font-semibold px-2 py-0.5 rounded-md text-xs"
              style={{ background: 'var(--node-memory-glow)', color: 'var(--node-memory)' }}
            >
              {data.ttl_minutes || 60}
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="1440"
            step="5"
            value={data.ttl_minutes || 60}
            onChange={(e) => updateNodeData(id, { ttl_minutes: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: 'var(--node-memory)' }}
          />
          <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mt-1">
            <span>5 хв</span>
            <span>24 год</span>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5"
        style={{ background: 'var(--node-memory)' }}
      />
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

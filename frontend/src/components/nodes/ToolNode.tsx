import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function ToolNode({ id, data }: { id: string; data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const isEnabled = data.enabled !== false;

  return (
    <div
      className="relative bg-[var(--bg-card)] rounded-xl border overflow-visible min-w-[240px] transition-all"
      style={{
        borderColor: isEnabled ? 'var(--node-tool)' : 'var(--border)',
        boxShadow: isEnabled ? '0 0 24px var(--node-tool-glow)' : 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5"
        style={{ background: 'var(--node-tool)' }}
      />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors"
            style={{
              background: isEnabled ? 'var(--node-tool-glow)' : 'var(--bg-elevated)',
            }}
          >
            {data.tool_icon || '🛠️'}
          </div>
          <div>
            <span className="text-sm font-semibold text-[var(--text-primary)] block leading-tight">
              {data.tool_name || 'Tool'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] leading-tight">
              {data.tool_description || ''}
            </span>
          </div>
        </div>
        <label className="relative cursor-pointer">
          <div
            className="w-9 h-5 rounded-full transition-colors relative"
            style={{
              background: isEnabled ? 'var(--node-tool)' : 'var(--bg-elevated)',
            }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all"
              style={{ left: isEnabled ? '18px' : '3px' }}
            />
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={isEnabled}
            onChange={() => updateNodeData(id, { enabled: !isEnabled })}
          />
        </label>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5"
        style={{ background: 'var(--node-tool)' }}
      />
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

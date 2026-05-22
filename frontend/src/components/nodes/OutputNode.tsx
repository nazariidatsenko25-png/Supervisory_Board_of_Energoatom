import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function OutputNode({ id, data }: { id: string; data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div
      className="relative bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-visible min-w-[280px] transition-all hover:shadow-[0_0_24px_var(--node-output-glow)]"
      style={{ borderColor: data.format ? 'var(--node-output)' : undefined }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5"
        style={{ background: 'var(--node-output)' }}
      />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--node-output-glow)' }}
        >
          📤
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Output Format</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            Формат
          </label>
          <select
            value={data.format || 'markdown'}
            onChange={(e) => updateNodeData(id, { format: e.target.value })}
            className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--node-output)] focus:border-[var(--node-output)] outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
            <option value="plain">Plain Text</option>
            <option value="html">HTML</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        {data.format === 'json' && (
          <div>
            <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
              JSON Schema (опціонально)
            </label>
            <textarea
              className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs h-20 focus:ring-1 focus:ring-[var(--node-output)] focus:border-[var(--node-output)] outline-none resize-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-mono-brand"
              placeholder='{ "type": "object", ... }'
              value={data.schema || ''}
              onChange={(e) => updateNodeData(id, { schema: e.target.value })}
            />
          </div>
        )}
      </div>
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

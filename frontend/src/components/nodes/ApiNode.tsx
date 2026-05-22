import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function ApiNode({ id, data }: { id: string; data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

  return (
    <div
      className="relative bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-visible min-w-[300px] transition-all hover:shadow-[0_0_24px_var(--node-api-glow)]"
      style={{ borderColor: data.url ? 'var(--node-api)' : undefined }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5"
        style={{ background: 'var(--node-api)' }}
      />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--node-api-glow)' }}
        >
          🔌
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">API Integration</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {/* Method + URL row */}
        <div className="flex gap-2">
          <select
            value={data.method || 'GET'}
            onChange={(e) => updateNodeData(id, { method: e.target.value })}
            className="w-24 p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[var(--node-api)] focus:border-[var(--node-api)] outline-none transition-all appearance-none cursor-pointer"
            style={{ color: 'var(--node-api)' }}
          >
            {methods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            className="flex-1 p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs focus:ring-1 focus:ring-[var(--node-api)] focus:border-[var(--node-api)] outline-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-mono-brand"
            placeholder="https://api.example.com/v1/..."
            value={data.url || ''}
            onChange={(e) => updateNodeData(id, { url: e.target.value })}
          />
        </div>

        {/* Headers */}
        <div>
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            Headers (JSON)
          </label>
          <textarea
            className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs h-14 focus:ring-1 focus:ring-[var(--node-api)] focus:border-[var(--node-api)] outline-none resize-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-mono-brand"
            placeholder='{ "Authorization": "Bearer ..." }'
            value={data.headers || ''}
            onChange={(e) => updateNodeData(id, { headers: e.target.value })}
          />
        </div>

        {/* Body (only for POST/PUT/PATCH) */}
        {['POST', 'PUT', 'PATCH'].includes(data.method || 'GET') && (
          <div>
            <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
              Body (JSON)
            </label>
            <textarea
              className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs h-14 focus:ring-1 focus:ring-[var(--node-api)] focus:border-[var(--node-api)] outline-none resize-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-mono-brand"
              placeholder='{ "key": "value" }'
              value={data.body || ''}
              onChange={(e) => updateNodeData(id, { body: e.target.value })}
            />
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5"
        style={{ background: 'var(--node-api)' }}
      />
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

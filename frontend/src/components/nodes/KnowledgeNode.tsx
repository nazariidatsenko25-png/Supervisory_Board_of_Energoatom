import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';
import { NodeAddMenu } from '@/components/NodeAddMenu';

export function KnowledgeNode({ id, data }: { id: string; data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div
      className="relative bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-visible min-w-[300px] transition-all hover:shadow-[0_0_24px_var(--node-knowledge-glow)]"
      style={{ borderColor: data.source_value ? 'var(--node-knowledge)' : undefined }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5"
        style={{ background: 'var(--node-knowledge)' }}
      />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--node-knowledge-glow)' }}
        >
          📚
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Knowledge Base</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            Тип джерела
          </label>
          <div className="flex gap-1.5">
            {(['url', 'text', 'file'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateNodeData(id, { source_type: t })}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: data.source_type === t ? 'var(--node-knowledge-glow)' : 'var(--bg-elevated)',
                  color: data.source_type === t ? 'var(--node-knowledge)' : 'var(--text-tertiary)',
                  border: `1px solid ${data.source_type === t ? 'var(--node-knowledge)' : 'var(--border)'}`,
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            {data.source_type === 'url' ? 'URL' : data.source_type === 'file' ? 'Шлях до файлу' : 'Текст'}
          </label>
          {data.source_type === 'text' ? (
            <textarea
              className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs h-20 focus:ring-1 focus:ring-[var(--node-knowledge)] focus:border-[var(--node-knowledge)] outline-none resize-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              placeholder="Введіть текст знань..."
              value={data.source_value || ''}
              onChange={(e) => updateNodeData(id, { source_value: e.target.value })}
            />
          ) : (
            <input
              type="text"
              className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs focus:ring-1 focus:ring-[var(--node-knowledge)] focus:border-[var(--node-knowledge)] outline-none transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              placeholder={data.source_type === 'url' ? 'https://...' : '/path/to/file.pdf'}
              value={data.source_value || ''}
              onChange={(e) => updateNodeData(id, { source_value: e.target.value })}
            />
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5"
        style={{ background: 'var(--node-knowledge)' }}
      />
      <NodeAddMenu sourceNodeId={id} />
    </div>
  );
}

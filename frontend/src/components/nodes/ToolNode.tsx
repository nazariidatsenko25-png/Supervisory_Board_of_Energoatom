import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';

export function ToolNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const activeTools = data.tools || [];

  const handleToggle = (tool: string) => {
    if (activeTools.includes(tool)) {
      updateNodeData(id, { tools: activeTools.filter((t: string) => t !== tool) });
    } else {
      updateNodeData(id, { tools: [...activeTools, tool] });
    }
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden min-w-[280px] transition-all hover:border-[var(--accent)] hover:shadow-[0_0_24px_var(--accent-glow)]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-[var(--accent)] !border-2 !border-[var(--bg-card)] rounded-full -translate-y-1.5" />
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <span className="text-base">🛠️</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Інструменти</span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {/* Web Search */}
        <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border border-[var(--border)] hover:border-[var(--text-tertiary)] group">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors ${activeTools.includes('web_search') ? 'bg-[var(--accent-glow)] text-[var(--accent)]' : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'}`}>
              🔍
            </div>
            <div>
              <span className={`text-sm font-medium block ${activeTools.includes('web_search') ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Web Search</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">Tavily API</span>
            </div>
          </div>
          <div className={`w-8 h-4 rounded-full transition-colors relative ${activeTools.includes('web_search') ? 'bg-[var(--accent)]' : 'bg-[var(--bg-elevated)]'}`}>
            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${activeTools.includes('web_search') ? 'left-4.5 right-0.5' : 'left-0.5'}`} style={activeTools.includes('web_search') ? {left: '18px'} : {left: '2px'}}></div>
          </div>
          <input 
            type="checkbox" 
            className="sr-only"
            checked={activeTools.includes('web_search')}
            onChange={() => handleToggle('web_search')}
          />
        </label>

        {/* Calculator */}
        <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border border-[var(--border)] hover:border-[var(--text-tertiary)] group">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors ${activeTools.includes('calculator') ? 'bg-[var(--accent-glow)] text-[var(--accent)]' : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'}`}>
              🧮
            </div>
            <div>
              <span className={`text-sm font-medium block ${activeTools.includes('calculator') ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Calculator</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">Math engine</span>
            </div>
          </div>
          <div className={`w-8 h-4 rounded-full transition-colors relative ${activeTools.includes('calculator') ? 'bg-[var(--accent)]' : 'bg-[var(--bg-elevated)]'}`}>
            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all`} style={activeTools.includes('calculator') ? {left: '18px'} : {left: '2px'}}></div>
          </div>
          <input 
            type="checkbox" 
            className="sr-only"
            checked={activeTools.includes('calculator')}
            onChange={() => handleToggle('calculator')}
          />
        </label>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-[var(--accent)] !border-2 !border-[var(--bg-card)] rounded-full translate-y-1.5" />
    </div>
  );
}

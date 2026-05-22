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
    <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden min-w-[280px] transition-all hover:shadow-2xl">
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-md -translate-y-2" />
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-white flex items-center gap-2">
          <span>🛠️</span> Інструменти (Tools)
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${activeTools.includes('web_search') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              🔍
            </div>
            <span className={`text-sm font-semibold ${activeTools.includes('web_search') ? 'text-slate-800' : 'text-slate-600'}`}>Web Search (Tavily)</span>
          </div>
          <input 
            type="checkbox" 
            className="w-5 h-5 text-emerald-500 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
            checked={activeTools.includes('web_search')}
            onChange={() => handleToggle('web_search')}
          />
        </label>
        
        {/* Calculator tool */}
        <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${activeTools.includes('calculator') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              🧮
            </div>
            <span className={`text-sm font-semibold ${activeTools.includes('calculator') ? 'text-slate-800' : 'text-slate-600'}`}>Calculator</span>
          </div>
          <input 
            type="checkbox" 
            className="w-5 h-5 text-emerald-500 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
            checked={activeTools.includes('calculator')}
            onChange={() => handleToggle('calculator')}
          />
        </label>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-md translate-y-2" />
    </div>
  );
}

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
    <div className="bg-white rounded-lg shadow-md border-2 border-emerald-400 p-4 min-w-[250px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500" />
      <div className="font-bold text-emerald-800 mb-2 border-b pb-1">Інструменти (Tools)</div>
      <div className="flex flex-col gap-2 mt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            checked={activeTools.includes('web_search')}
            onChange={() => handleToggle('web_search')}
          />
          <span className="text-sm font-medium text-gray-700">Web Search (Brave)</span>
        </label>
        {/* Placeholder for future tools */}
        <label className="flex items-center gap-2 cursor-pointer opacity-50">
          <input type="checkbox" disabled className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-500">Calculator (Coming soon)</span>
        </label>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
}

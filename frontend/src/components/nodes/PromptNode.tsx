import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';

export function PromptNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden min-w-[320px] transition-all hover:shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-white flex items-center gap-2">
          <span>📝</span> Системний Промпт
        </div>
      </div>
      <div className="p-5">
        <label className="block text-sm font-medium text-slate-600 mb-2">Інструкції для агента:</label>
        <textarea
          className="w-full p-3 border border-slate-200 rounded-xl text-sm h-28 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm transition-shadow bg-slate-50 focus:bg-white"
          placeholder="Ти корисний асистент..."
          value={data.system_prompt || ''}
          onChange={(e) => updateNodeData(id, { system_prompt: e.target.value })}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-md translate-y-2" />
    </div>
  );
}

import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';

export function GuardrailNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden min-w-[280px] transition-all hover:shadow-2xl">
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-orange-500 border-2 border-white rounded-full shadow-md -translate-y-2" />
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-white flex items-center gap-2">
          <span>🛡️</span> Обмеження
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-end mb-3">
          <label className="text-sm font-medium text-slate-600">
            Максимум ітерацій
          </label>
          <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-lg text-sm shadow-inner">
            {data.max_iterations || 5}
          </span>
        </div>
        <div className="relative pt-1">
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={data.max_iterations || 5}
            onChange={(e) => updateNodeData(id, { max_iterations: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
        <p className="text-xs text-slate-500 mt-4 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-2">
          <span className="text-orange-500">ℹ️</span> Запобігає безкінечним циклам моделі (вигорянню токенів).
        </p>
      </div>
    </div>
  );
}

import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';

export function GuardrailNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-orange-400 p-4 min-w-[250px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      <div className="font-bold text-orange-800 mb-2 border-b pb-1">Обмеження (Guardrails)</div>
      <div className="mt-2">
        <label className="block text-sm text-gray-600 mb-1">
          Максимум ітерацій (ReAct):
          <span className="ml-2 font-bold text-orange-600">{data.max_iterations || 5}</span>
        </label>
        <input
          type="range"
          min="1"
          max="15"
          step="1"
          value={data.max_iterations || 5}
          onChange={(e) => updateNodeData(id, { max_iterations: parseInt(e.target.value) })}
          className="w-full accent-orange-500"
        />
        <p className="text-xs text-gray-400 mt-1">Запобігає безкінечним циклам моделі.</p>
      </div>
    </div>
  );
}

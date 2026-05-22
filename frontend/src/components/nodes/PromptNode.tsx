import { Handle, Position } from 'reactflow';
import { useStore } from '@/store/agentStore';

export function PromptNode({ id, data }: { id: string, data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-blue-400 p-4 min-w-[300px]">
      <div className="font-bold text-blue-800 mb-2 border-b pb-1">Системний Промпт</div>
      <label className="block text-sm text-gray-600 mb-1">Інструкції для агента:</label>
      <textarea
        className="w-full p-2 border rounded-md text-sm h-24 focus:ring-2 focus:ring-blue-400 outline-none"
        value={data.system_prompt || ''}
        onChange={(e) => updateNodeData(id, { system_prompt: e.target.value })}
      />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}

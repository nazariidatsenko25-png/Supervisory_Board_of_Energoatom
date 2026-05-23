import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from 'reactflow';

// ─── NODE CATALOG ───

export type NodeCatalogItem = {
  type: string;
  label: string;
  icon: string;
  description: string;
  category: 'core' | 'tools' | 'data' | 'logic';
  defaultData: Record<string, any>;
};

export const NODE_CATALOG: NodeCatalogItem[] = [
  // Core
  {
    type: 'prompt',
    label: 'Системний Промпт',
    icon: '📝',
    description: 'Інструкції для агента',
    category: 'core',
    defaultData: { system_prompt: '' },
  },
  {
    type: 'guardrail',
    label: 'Обмеження',
    icon: '🛡️',
    description: 'Ліміти ітерацій',
    category: 'core',
    defaultData: { max_iterations: 5 },
  },

  // Tools
  {
    type: 'tool',
    label: 'Web Search',
    icon: '🔍',
    description: 'Tavily API пошук',
    category: 'tools',
    defaultData: { tool_id: 'web_search', tool_name: 'Web Search', tool_description: 'Tavily API', tool_icon: '🔍', enabled: true },
  },
  {
    type: 'tool',
    label: 'Calculator',
    icon: '🧮',
    description: 'Математичний двигун',
    category: 'tools',
    defaultData: { tool_id: 'calculator', tool_name: 'Calculator', tool_description: 'Math engine', tool_icon: '🧮', enabled: true },
  },
  {
    type: 'tool',
    label: 'Code Interpreter',
    icon: '💻',
    description: 'Виконання Python',
    category: 'tools',
    defaultData: { tool_id: 'code_interpreter', tool_name: 'Code Interpreter', tool_description: 'Python sandbox', tool_icon: '💻', enabled: true },
  },
  {
    type: 'tool',
    label: 'Image Generation',
    icon: '🎨',
    description: 'DALL·E / Stable Diffusion',
    category: 'tools',
    defaultData: { tool_id: 'image_generation', tool_name: 'Image Generation', tool_description: 'AI image gen', tool_icon: '🎨', enabled: true },
  },
  {
    type: 'tool',
    label: 'File Reader',
    icon: '📄',
    description: 'Читання файлів',
    category: 'tools',
    defaultData: { tool_id: 'file_reader', tool_name: 'File Reader', tool_description: 'PDF, DOCX, TXT', tool_icon: '📄', enabled: true },
  },

  // Data
  {
    type: 'knowledge',
    label: 'Knowledge Base',
    icon: '📚',
    description: 'Джерело знань',
    category: 'data',
    defaultData: { source_type: 'url', source_value: '', chunk_size: 500 },
  },
  {
    type: 'api',
    label: 'API Integration',
    icon: '🔌',
    description: 'HTTP endpoint',
    category: 'data',
    defaultData: { method: 'GET', url: '', headers: '', body: '' },
  },
  {
    type: 'memory',
    label: 'Memory',
    icon: '🧠',
    description: 'Контекст сесії',
    category: 'data',
    defaultData: { memory_type: 'session', ttl_minutes: 60 },
  },

  // Logic
  {
    type: 'condition',
    label: 'Condition',
    icon: '🔀',
    description: 'If / else логіка',
    category: 'logic',
    defaultData: { expression: '', true_label: 'True', false_label: 'False' },
  },
  {
    type: 'output_format',
    label: 'Output Format',
    icon: '📤',
    description: 'Формат відповіді',
    category: 'logic',
    defaultData: { format: 'markdown', schema: '' },
  },
];

export const CATEGORIES = [
  { id: 'core', label: 'Core', icon: '⚡' },
  { id: 'tools', label: 'Інструменти', icon: '🛠️' },
  { id: 'data', label: 'Дані', icon: '💾' },
  { id: 'logic', label: 'Логіка', icon: '🧩' },
] as const;

// ─── AGENT CONFIG ───

export type AgentConfig = {
  system_prompt: string;
  tools: string[];
  max_iterations: number;
  knowledge_sources: { source_type: string; source_value: string }[];
  output_format: { format: string; schema: string } | null;
  api_integrations: { method: string; url: string; headers: string; body: string }[];
  memory_config: { memory_type: string; ttl_minutes: number } | null;
  conditions: { expression: string }[];
};

// ─── STORE ───

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, data: any) => void;
  addNode: (type: string, position: XYPosition, data: Record<string, any>) => void;
  addNodeWithEdge: (sourceNodeId: string, type: string, data: Record<string, any>, sourceHandleId?: string) => void;
  removeNode: (nodeId: string) => void;
  getAgentConfig: () => AgentConfig;
};

let nodeIdCounter = 10;

const initialNodes: Node[] = [
  {
    id: 'prompt-1',
    type: 'prompt',
    position: { x: 250, y: 80 },
    data: { system_prompt: 'Ви - корисний AI-асистент.' },
  },
];

const initialEdges: Edge[] = [];

export const useStore = create<RFState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  updateNodeData: (nodeId: string, data: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },

  addNode: (type: string, position: XYPosition, data: Record<string, any>) => {
    const id = `${type}-${++nodeIdCounter}`;
    const newNode: Node = {
      id,
      type,
      position,
      data: { ...data },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  addNodeWithEdge: (sourceNodeId: string, type: string, data: Record<string, any>, sourceHandleId?: string) => {
    const sourceNode = get().nodes.find((n) => n.id === sourceNodeId);
    if (!sourceNode) return;

    const id = `${type}-${++nodeIdCounter}`;
    // Count existing children from this source to stagger horizontally
    const existingChildren = get().edges.filter((e) => e.source === sourceNodeId).length;
    const xOffset = existingChildren * 320;

    const newNode: Node = {
      id,
      type,
      position: {
        x: sourceNode.position.x + xOffset,
        y: sourceNode.position.y + 260,
      },
      data: { ...data },
    };

    const newEdge: Edge = {
      id: `e-${sourceNodeId}-${id}`,
      source: sourceNodeId,
      target: id,
      ...(sourceHandleId ? { sourceHandle: sourceHandleId } : {}),
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
    });
  },

  removeNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    });
  },

  getAgentConfig: () => {
    const nodes = get().nodes;

    let system_prompt = 'Ви - корисний AI-асистент.';
    const tools: string[] = [];
    let max_iterations = 5;
    const knowledge_sources: { source_type: string; source_value: string }[] = [];
    let output_format: { format: string; schema: string } | null = null;
    const api_integrations: { method: string; url: string; headers: string; body: string }[] = [];
    let memory_config: { memory_type: string; ttl_minutes: number } | null = null;
    const conditions: { expression: string }[] = [];

    nodes.forEach((node) => {
      switch (node.type) {
        case 'prompt':
          if (node.data?.system_prompt) system_prompt = node.data.system_prompt;
          break;
        case 'tool':
          if (node.data?.enabled && node.data?.tool_id) {
            tools.push(node.data.tool_id);
          }
          break;
        case 'guardrail':
          if (node.data?.max_iterations) max_iterations = node.data.max_iterations;
          break;
        case 'knowledge':
          if (node.data?.source_value) {
            knowledge_sources.push({
              source_type: node.data.source_type || 'url',
              source_value: node.data.source_value,
            });
          }
          break;
        case 'output_format':
          output_format = {
            format: node.data?.format || 'markdown',
            schema: node.data?.schema || '',
          };
          break;
        case 'api':
          if (node.data?.url) {
            api_integrations.push({
              method: node.data.method || 'GET',
              url: node.data.url,
              headers: node.data.headers || '',
              body: node.data.body || '',
            });
          }
          break;
        case 'memory':
          memory_config = {
            memory_type: node.data?.memory_type || 'session',
            ttl_minutes: node.data?.ttl_minutes || 60,
          };
          break;
        case 'condition':
          if (node.data?.expression) {
            conditions.push({ expression: node.data.expression });
          }
          break;
      }
    });

    return {
      system_prompt,
      tools,
      max_iterations,
      knowledge_sources,
      output_format,
      api_integrations,
      memory_config,
      conditions,
    };
  },
}));

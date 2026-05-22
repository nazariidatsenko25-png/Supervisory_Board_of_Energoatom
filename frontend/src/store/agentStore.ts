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
} from 'reactflow';

export type AgentConfig = {
  system_prompt: string;
  tools: string[];
  max_iterations: int;
};

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, data: any) => void;
  getAgentConfig: () => AgentConfig;
};

const initialNodes: Node[] = [
  {
    id: 'prompt-node',
    type: 'prompt',
    position: { x: 250, y: 50 },
    data: { system_prompt: 'Ви - корисний AI-асистент.' },
  },
  {
    id: 'tool-node',
    type: 'tool',
    position: { x: 250, y: 250 },
    data: { tools: [] },
  },
  {
    id: 'guardrail-node',
    type: 'guardrail',
    position: { x: 250, y: 450 },
    data: { max_iterations: 5 },
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'prompt-node', target: 'tool-node' },
  { id: 'e2-3', source: 'tool-node', target: 'guardrail-node' },
];

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
  getAgentConfig: () => {
    const nodes = get().nodes;
    let system_prompt = "Ви - корисний AI-асистент.";
    let tools: string[] = [];
    let max_iterations = 5;

    nodes.forEach(node => {
      if (node.type === 'prompt' && node.data?.system_prompt) {
        system_prompt = node.data.system_prompt;
      }
      if (node.type === 'tool' && node.data?.tools) {
        tools = node.data.tools;
      }
      if (node.type === 'guardrail' && node.data?.max_iterations) {
        max_iterations = node.data.max_iterations;
      }
    });

    return {
      system_prompt,
      tools,
      max_iterations
    };
  }
}));

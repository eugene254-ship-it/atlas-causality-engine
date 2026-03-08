import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodes as causalNodes, edges as causalEdges } from '@/data/causalData';
import { domainColors } from '@/lib/domainUtils';
import CausalGraphNode from './CausalGraphNode';
import CausalGraphEdge from './CausalGraphEdge';
import { useDashboardStore } from '@/store/dashboardStore';

const nodeTypes = { causal: CausalGraphNode };
const edgeTypes = { causal: CausalGraphEdge };

// Manual layout positions for the chain
const nodePositions: Record<string, { x: number; y: number }> = {
  'rainfall-deficit': { x: 0, y: 200 },
  'crop-output': { x: 280, y: 200 },
  'grain-supply': { x: 560, y: 200 },
  'transport-costs': { x: 420, y: 0 },
  'currency-weakness': { x: 420, y: 400 },
  'grain-prices': { x: 840, y: 200 },
  'food-stress': { x: 1120, y: 200 },
  'urban-dissatisfaction': { x: 1400, y: 120 },
  'protest-risk': { x: 1680, y: 60 },
  'malnutrition': { x: 1400, y: 320 },
  'subsidy-pressure': { x: 1680, y: 240 },
};

export default function CausalCanvas() {
  const { setSelectedNode, setSelectedEdge } = useDashboardStore();

  const flowNodes: Node[] = useMemo(
    () =>
      causalNodes.map((node) => ({
        id: node.id,
        type: 'causal',
        position: nodePositions[node.id] || { x: 0, y: 0 },
        data: { node },
      })),
    []
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      causalEdges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'causal',
        data: { edge },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: edge.polarity === 'positive' ? 'hsl(38, 80%, 55%)' : 'hsl(174, 60%, 50%)',
        },
      })),
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(220, 14%, 15%)" gap={40} size={1} />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor={(node) => {
            const d = node.data?.node?.domain;
            return d ? domainColors[d as keyof typeof domainColors] : '#666';
          }}
          maskColor="hsl(220, 20%, 7%, 0.85)"
          position="bottom-left"
          style={{ width: 160, height: 100 }}
        />
      </ReactFlow>
    </div>
  );
}

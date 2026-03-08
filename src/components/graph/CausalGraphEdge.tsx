import { memo, useMemo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { CausalEdge, Confidence, getNodeById } from '@/data/causalData';
import { useDashboardStore } from '@/store/dashboardStore';

interface CausalEdgeData {
  edge: CausalEdge;
}

const confidenceStroke: Record<Confidence, string> = {
  high: '',
  medium: '8 4',
  low: '4 4',
};

const CausalGraphEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<CausalEdgeData>) => {
  const { edge } = data!;
  const { selectedNodeId, selectedEdgeId, setSelectedEdge, timelinePosition } = useDashboardStore();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });

  // Timeline-driven: modulate stroke width based on source node's trend intensity
  const sourceNode = useMemo(() => getNodeById(edge.sourceId), [edge.sourceId]);
  const sourceTrend = sourceNode ? (sourceNode.trendData[timelinePosition] ?? 50) / 100 : 0.5;

  const isRelated = selectedNodeId === edge.sourceId || selectedNodeId === edge.targetId;
  const isSelected = selectedEdgeId === id;
  const isDimmed = selectedNodeId && !isRelated;

  const baseStrokeWidth = 1 + edge.influenceStrength * 3;
  const strokeWidth = baseStrokeWidth * (0.4 + sourceTrend * 0.6); // scale with timeline
  const baseColor = edge.polarity === 'positive' ? 'hsl(38, 80%, 55%)' : 'hsl(174, 60%, 50%)';
  const opacity = isDimmed ? 0.1 : isRelated || isSelected ? 1 : 0.3 + sourceTrend * 0.4;

  return (
    <g onClick={() => setSelectedEdge(isSelected ? null : id)} className="cursor-pointer">
      {/* Invisible wider path for easier clicking */}
      <path d={edgePath} fill="none" stroke="transparent" strokeWidth={20} />
      {/* Glow */}
      {(isRelated || isSelected) && (
        <path
          d={edgePath}
          fill="none"
          stroke={baseColor}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={0.15}
        />
      )}
      {/* Main edge */}
      <path
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        strokeDasharray={confidenceStroke[edge.confidence]}
        markerEnd={markerEnd}
        style={{ transition: 'stroke-width 0.5s, stroke-opacity 0.5s' }}
      />
      {/* Strength label */}
      {(isRelated || isSelected) && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect x={-18} y={-10} width={36} height={20} rx={4} fill="hsl(220, 18%, 10%)" stroke={baseColor} strokeWidth={0.5} strokeOpacity={0.5} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill={baseColor}
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
          >
            {Math.round(edge.influenceStrength * 100)}%
          </text>
        </g>
      )}
    </g>
  );
});

CausalGraphEdge.displayName = 'CausalGraphEdge';

export default CausalGraphEdge;

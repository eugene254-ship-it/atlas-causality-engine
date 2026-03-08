import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CausalNode } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { useDashboardStore } from '@/store/dashboardStore';

interface CausalNodeData {
  node: CausalNode;
}

const CausalGraphNode = memo(({ data, id }: NodeProps<CausalNodeData>) => {
  const { node } = data;
  const { selectedNodeId, hoveredNodeId, setSelectedNode, setHoveredNode } = useDashboardStore();
  
  const isSelected = selectedNodeId === id;
  const isHovered = hoveredNodeId === id;
  const color = domainColors[node.domain];
  const icon = domainIcons[node.domain];
  const sevColor = severityColors[node.severity];
  
  const handleClick = useCallback(() => {
    setSelectedNode(isSelected ? null : id);
  }, [id, isSelected, setSelectedNode]);

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setHoveredNode(id)}
      onMouseLeave={() => setHoveredNode(null)}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-3 !h-3" />
      
      {/* Severity ring */}
      <div
        className={`absolute -inset-1 rounded-xl opacity-30 ${node.severity === 'critical' ? 'severity-pulse' : ''}`}
        style={{ backgroundColor: sevColor }}
      />
      
      {/* Main node */}
      <div
        className={`relative rounded-lg px-4 py-3 min-w-[160px] max-w-[200px] border transition-all duration-200 ${
          isSelected ? 'ring-2 ring-offset-1 ring-offset-background scale-105' : ''
        } ${isHovered ? 'scale-102' : ''}`}
        style={{
          backgroundColor: `hsl(220, 18%, ${isSelected ? 14 : 11}%)`,
          borderColor: isSelected ? color : `${color}44`,
          boxShadow: isSelected ? `0 0 20px ${color}33` : isHovered ? `0 0 12px ${color}22` : 'none',
          ringColor: color,
        }}
      >
        {/* Domain icon + label */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm">{icon}</span>
          <span
            className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {node.domain}
          </span>
        </div>
        
        {/* Node label */}
        <div className="text-sm font-semibold text-foreground leading-tight mb-1">
          {node.label}
        </div>
        
        {/* Value */}
        {node.currentValue && (
          <div className="text-xs font-mono" style={{ color }}>
            {node.currentValue}
          </div>
        )}
        
        {/* Bottom stats */}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <span style={{ color: sevColor }}>●</span>
            {node.severity}
          </span>
          <span>·</span>
          <span>{node.evidenceCount} sources</span>
        </div>

        {/* Intervention badge */}
        {node.interventionEligible && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[8px] text-primary-foreground font-bold">⚡</span>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-3 !h-3" />
    </div>
  );
});

CausalGraphNode.displayName = 'CausalGraphNode';

export default CausalGraphNode;

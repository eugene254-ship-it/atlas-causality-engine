import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CausalNode } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { useDashboardStore } from '@/store/dashboardStore';

interface CausalNodeData {
  node: CausalNode;
}

// Derive dynamic severity from trend value at timeline position
function getDynamicSeverity(trendValue: number): 'critical' | 'high' | 'medium' | 'low' {
  if (trendValue >= 70) return 'critical';
  if (trendValue >= 50) return 'high';
  if (trendValue >= 30) return 'medium';
  return 'low';
}

const CausalGraphNode = memo(({ data, id }: NodeProps<CausalNodeData>) => {
  const { node } = data;
  const { selectedNodeId, hoveredNodeId, setSelectedNode, setHoveredNode, timelinePosition } = useDashboardStore();
  
  const isSelected = selectedNodeId === id;
  const isHovered = hoveredNodeId === id;
  const color = domainColors[node.domain];
  const icon = domainIcons[node.domain];

  // Timeline-driven animation: use trendData at current position
  const trendValue = node.trendData[timelinePosition] ?? node.trendData[node.trendData.length - 1];
  const dynamicSeverity = useMemo(() => getDynamicSeverity(trendValue), [trendValue]);
  const sevColor = severityColors[dynamicSeverity];
  
  // Intensity scales with trend value (0-100)
  const intensity = trendValue / 100;
  const shouldPulse = dynamicSeverity === 'critical';
  
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
      
      {/* Severity ring - animated by timeline */}
      <div
        className={`absolute -inset-1 rounded-xl transition-all duration-500 ${shouldPulse ? 'severity-pulse' : ''}`}
        style={{ 
          backgroundColor: sevColor,
          opacity: 0.15 + intensity * 0.25,
          transform: `scale(${1 + intensity * 0.05})`,
        }}
      />
      
      {/* Main node */}
      <div
        className={`relative rounded-lg px-4 py-3 min-w-[160px] max-w-[200px] border transition-all duration-500 ${
          isSelected ? 'ring-2 ring-offset-1 ring-offset-background scale-105' : ''
        } ${isHovered ? 'scale-102' : ''}`}
        style={{
          backgroundColor: `hsl(220, 18%, ${isSelected ? 14 : 11}%)`,
          borderColor: isSelected ? color : `${color}44`,
          boxShadow: isSelected 
            ? `0 0 20px ${color}33` 
            : isHovered 
              ? `0 0 12px ${color}22` 
              : `0 0 ${Math.round(intensity * 8)}px ${sevColor}${Math.round(intensity * 30).toString(16).padStart(2, '0')}`,
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
        
        {/* Dynamic value based on timeline */}
        {node.currentValue && (
          <div className="text-xs font-mono transition-colors duration-300" style={{ color }}>
            {node.currentValue}
          </div>
        )}
        
        {/* Bottom stats - shows dynamic severity */}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5 transition-colors duration-300">
            <span style={{ color: sevColor }}>●</span>
            {dynamicSeverity}
          </span>
          <span>·</span>
          <span>{node.evidenceCount} sources</span>
          <span>·</span>
          <span className="font-mono" style={{ color: sevColor }}>{Math.round(trendValue)}%</span>
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

import { useMemo, useState } from 'react';
import { nodes, edges as causalEdges } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { MapPin, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Domain } from '@/data/causalData';

// Geographic positions for nodes across East Africa (normalized 0-100 coordinates on map)
const geoPositions: Record<string, { x: number; y: number; location: string }> = {
  'rainfall-deficit': { x: 62, y: 28, location: 'Eastern Ethiopia (Oromia)' },
  'crop-output': { x: 58, y: 35, location: 'SNNPR / Oromia, Ethiopia' },
  'grain-supply': { x: 52, y: 48, location: 'Ethiopia-Kenya Border Corridor' },
  'grain-prices': { x: 45, y: 62, location: 'Nairobi, Kenya' },
  'transport-costs': { x: 50, y: 72, location: 'Mombasa-Nairobi Corridor' },
  'food-stress': { x: 43, y: 58, location: 'Nairobi Informal Settlements' },
  'currency-weakness': { x: 40, y: 65, location: 'Nairobi (CBK)' },
  'urban-dissatisfaction': { x: 42, y: 55, location: 'Nairobi Urban Areas' },
  'protest-risk': { x: 44, y: 53, location: 'Nairobi CBD / Kibera' },
  'malnutrition': { x: 46, y: 60, location: 'Nairobi / Turkana' },
  'subsidy-pressure': { x: 41, y: 50, location: 'Nairobi (Parliament)' },
};

// SVG path for simplified East Africa outline
const eastAfricaPath = `M 30 10 L 70 10 L 75 15 L 78 25 L 72 35 L 68 45 L 65 55 L 60 65 L 55 75 L 50 80 L 45 85 L 38 80 L 35 70 L 30 60 L 28 50 L 25 40 L 27 30 L 28 20 Z`;

// Country borders (simplified)
const countries = [
  { name: 'Ethiopia', labelX: 60, labelY: 22, path: 'M 48 10 L 75 10 L 78 25 L 72 35 L 55 40 L 48 35 L 45 25 Z' },
  { name: 'Kenya', labelX: 45, labelY: 60, path: 'M 35 40 L 55 40 L 65 55 L 55 75 L 38 80 L 30 60 L 35 45 Z' },
  { name: 'Somalia', labelX: 72, labelY: 45, path: 'M 72 35 L 78 25 L 82 35 L 78 55 L 65 55 Z' },
  { name: 'Uganda', labelX: 30, labelY: 42, path: 'M 25 35 L 35 35 L 38 45 L 35 50 L 25 48 Z' },
  { name: 'Tanzania', labelX: 42, labelY: 82, path: 'M 35 70 L 55 75 L 58 85 L 35 85 Z' },
];

export default function MapView() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const selectedData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  // Connection lines between geographically placed nodes
  const connections = useMemo(() => {
    return causalEdges.map(edge => {
      const from = geoPositions[edge.sourceId];
      const to = geoPositions[edge.targetId];
      if (!from || !to) return null;
      return { ...edge, from, to };
    }).filter(Boolean) as Array<typeof causalEdges[0] & { from: { x: number; y: number }; to: { x: number; y: number } }>;
  }, []);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Map area */}
      <div className="flex-1 relative bg-background">
        <div className="absolute inset-0 grid-bg" />
        
        {/* Header */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">East Africa Spatial View</span>
          </div>
        </div>

        {/* SVG Map */}
        <svg viewBox="15 5 75 90" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Country fills */}
          {countries.map(c => (
            <path
              key={c.name}
              d={c.path}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth="0.3"
              opacity={0.6}
            />
          ))}

          {/* Country labels */}
          {countries.map(c => (
            <text
              key={`label-${c.name}`}
              x={c.labelX}
              y={c.labelY}
              textAnchor="middle"
              className="text-[2.5px] font-mono uppercase tracking-widest"
              fill="hsl(var(--muted-foreground))"
              opacity={0.5}
            >
              {c.name}
            </text>
          ))}

          {/* Connection lines */}
          {connections.map(conn => (
            <line
              key={conn.id}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke={conn.polarity === 'positive' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
              strokeWidth={conn.influenceStrength * 0.8}
              opacity={0.3}
              strokeDasharray={conn.influenceStrength < 0.5 ? '1 1' : 'none'}
            />
          ))}

          {/* Node markers */}
          {nodes.map(node => {
            const pos = geoPositions[node.id];
            if (!pos) return null;
            const color = domainColors[node.domain];
            const sevColor = severityColors[node.severity];
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                className="cursor-pointer"
              >
                {/* Severity pulse ring */}
                {node.severity === 'critical' && (
                  <circle
                    r={3}
                    fill="none"
                    stroke={sevColor}
                    strokeWidth={0.3}
                    opacity={0.4}
                    className="severity-pulse"
                  />
                )}

                {/* Outer glow */}
                <circle
                  r={isHovered || isSelected ? 2.5 : 2}
                  fill={color}
                  opacity={isHovered || isSelected ? 0.3 : 0.15}
                />

                {/* Inner dot */}
                <circle
                  r={isHovered || isSelected ? 1.2 : 0.9}
                  fill={color}
                  stroke={isSelected ? 'hsl(var(--foreground))' : 'none'}
                  strokeWidth={0.3}
                />

                {/* Label */}
                <text
                  y={-3}
                  textAnchor="middle"
                  className="text-[1.8px] font-semibold"
                  fill="hsl(var(--foreground))"
                  opacity={isHovered || isSelected ? 1 : 0.7}
                >
                  {node.label}
                </text>

                {/* Location sublabel on hover */}
                {(isHovered || isSelected) && (
                  <text
                    y={3.5}
                    textAnchor="middle"
                    className="text-[1.4px]"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {pos.location}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="p-3 rounded-lg bg-card/90 backdrop-blur-sm border border-border">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Domains</div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
              {(Object.entries(domainIcons) as [Domain, string][]).map(([domain, icon]) => (
                <div key={domain} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: domainColors[domain] }}
                  />
                  <span className="text-[10px] text-muted-foreground capitalize">{icon} {domain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-border bg-card overflow-hidden flex-shrink-0"
          >
            <div className="w-80 h-full overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{domainIcons[selectedData.domain]}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedData.label}</h3>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    {geoPositions[selectedData.id]?.location}
                  </span>
                </div>
              </div>

              <p className="text-xs text-secondary-foreground leading-relaxed">{selectedData.description}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-muted">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Current</div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: domainColors[selectedData.domain] }}>
                    {selectedData.currentValue || 'N/A'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-muted">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Severity</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[selectedData.severity] }} />
                    <span className="text-sm font-medium capitalize text-foreground">{selectedData.severity}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Info size={11} className="text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Geographic Context</span>
                </div>
                <p className="text-xs text-secondary-foreground">
                  Located in {geoPositions[selectedData.id]?.location}. This factor has {selectedData.upstreamCount} upstream dependencies and {selectedData.downstreamCount} downstream impacts in the causal chain.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

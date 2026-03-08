import { useDashboardStore } from '@/store/dashboardStore';
import { getNodeById, getUpstreamNodes, getDownstreamNodes } from '@/data/causalData';
import { domainColors, domainIcons, severityColors, confidenceLabels } from '@/lib/domainUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AnnotationsPanel from '@/components/panels/AnnotationsPanel';

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r={2.5}
        fill={color}
      />
    </svg>
  );
}

export default function NodeInspector() {
  const { selectedNodeId, setSelectedNode } = useDashboardStore();
  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;

  if (!node) return null;

  const upstream = getUpstreamNodes(node.id);
  const downstream = getDownstreamNodes(node.id);
  const color = domainColors[node.domain];

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="h-full flex flex-col border-l border-border bg-card overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{domainIcons[node.domain]}</span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{node.label}</h3>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 inline-block"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  {node.domain}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded hover:bg-accent text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 flex-1">
          {/* Description */}
          <p className="text-xs text-secondary-foreground leading-relaxed">
            {node.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Current</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color }}>
                {node.currentValue || 'N/A'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Change</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: severityColors[node.severity] }}>
                {node.changeDelta || 'N/A'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Severity</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[node.severity] }} />
                <span className="text-sm font-medium capitalize text-foreground">{node.severity}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Confidence</div>
              <div className="text-sm font-medium capitalize text-foreground mt-0.5">{node.confidence}</div>
            </div>
          </div>

          {/* Trend */}
          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase mb-2">12-Month Trend</div>
            <div className="p-3 rounded-lg bg-muted">
              <Sparkline data={node.trendData} color={color} />
            </div>
          </div>

          {/* Upstream */}
          {upstream.length > 0 && (
            <div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase mb-2">
                Upstream Dependencies ({upstream.length})
              </div>
              <div className="space-y-1">
                {upstream.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs text-secondary-foreground hover:bg-accent flex items-center gap-2 transition-colors"
                  >
                    <span>{domainIcons[n.domain]}</span>
                    <span>{n.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Downstream */}
          {downstream.length > 0 && (
            <div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase mb-2">
                Downstream Impacts ({downstream.length})
              </div>
              <div className="space-y-1">
                {downstream.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs text-secondary-foreground hover:bg-accent flex items-center gap-2 transition-colors"
                  >
                    <span>{domainIcons[n.domain]}</span>
                    <span>{n.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Intervention eligible */}
          {node.interventionEligible && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <span>⚡</span>
                Intervention point available
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                This node is eligible for direct policy intervention.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

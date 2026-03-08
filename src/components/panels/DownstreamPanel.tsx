import { useDashboardStore } from '@/store/dashboardStore';
import { getDownstreamNodes, getNodeById, edges } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DownstreamPanel() {
  const { selectedNodeId, setSelectedNode } = useDashboardStore();
  const sourceNode = selectedNodeId ? getNodeById(selectedNodeId) : null;

  const downstream = selectedNodeId
    ? edges
        .filter(e => e.sourceId === selectedNodeId)
        .map(e => ({
          node: getNodeById(e.targetId)!,
          edge: e,
        }))
        .filter(d => d.node)
        .sort((a, b) => b.edge.influenceStrength - a.edge.influenceStrength)
    : [];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Downstream Effects
        </h3>
        {sourceNode && (
          <p className="text-sm text-foreground mt-1 font-medium">
            from {sourceNode.label}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {downstream.map(({ node, edge }, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedNode(node.id)}
              className="p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{domainIcons[node.domain]}</span>
                <span className="text-sm font-medium text-foreground flex-1 leading-tight">
                  {node.label}
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      edge.polarity === 'positive' ? 'text-severity-high' : 'text-primary'
                    }`}
                    style={{
                      backgroundColor: edge.polarity === 'positive'
                        ? 'hsl(25, 80%, 55%, 0.15)'
                        : 'hsl(174, 60%, 50%, 0.15)',
                    }}
                  >
                    {edge.polarity === 'positive' ? '↑ Amplifies' : '↓ Dampens'}
                  </span>
                </div>
              </div>

              {node.currentValue && (
                <div className="text-xs font-mono mb-1.5" style={{ color: severityColors[node.severity] }}>
                  {node.currentValue}
                </div>
              )}

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                <span>Strength: {Math.round(edge.influenceStrength * 100)}%</span>
                <span>Lag: {edge.lagMin}-{edge.lagMax}w</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {downstream.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>{selectedNodeId ? 'No downstream effects' : 'Select a node to see ripple effects'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

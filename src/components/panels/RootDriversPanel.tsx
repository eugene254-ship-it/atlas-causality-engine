import { useDashboardStore } from '@/store/dashboardStore';
import { nodes, edges, getUpstreamNodes, getNodeById } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootDriversPanel() {
  const { selectedNodeId, setSelectedNode } = useDashboardStore();

  const targetNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  
  // Get upstream drivers for selected node, or show top drivers globally
  const drivers = selectedNodeId
    ? edges
        .filter(e => e.targetId === selectedNodeId)
        .map(e => ({
          node: getNodeById(e.sourceId)!,
          edge: e,
        }))
        .filter(d => d.node)
        .sort((a, b) => b.edge.influenceStrength - a.edge.influenceStrength)
    : nodes
        .filter(n => n.severity === 'critical' || n.severity === 'high')
        .sort((a, b) => b.evidenceCount - a.evidenceCount)
        .slice(0, 5)
        .map(n => ({
          node: n,
          edge: edges.find(e => e.sourceId === n.id),
        }));

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Root Drivers
        </h3>
        {targetNode && (
          <p className="text-sm text-foreground mt-1 font-medium">
            for {targetNode.label}
          </p>
        )}
        {!targetNode && (
          <p className="text-xs text-muted-foreground mt-1">
            Top active drivers globally
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {drivers.map(({ node, edge }, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedNode(node.id)}
              className="p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{domainIcons[node.domain]}</span>
                <span className="text-sm font-medium text-foreground flex-1 leading-tight">
                  {node.label}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: severityColors[node.severity] }}
                />
              </div>
              
              {edge && (
                <div className="space-y-1.5">
                  {/* Influence bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono w-16">
                      Weight
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${edge.influenceStrength * 100}%`,
                          backgroundColor: domainColors[node.domain],
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground w-8 text-right">
                      {Math.round(edge.influenceStrength * 100)}%
                    </span>
                  </div>
                  
                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                    <span>{edge.confidence} conf.</span>
                    <span>{edge.lagMin}-{edge.lagMax}w lag</span>
                    <span>{node.evidenceCount} src</span>
                  </div>
                </div>
              )}
              
              {!edge && node.currentValue && (
                <div className="text-xs font-mono" style={{ color: domainColors[node.domain] }}>
                  {node.currentValue}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {drivers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>Select a node to see its upstream drivers</p>
          </div>
        )}
      </div>
    </div>
  );
}

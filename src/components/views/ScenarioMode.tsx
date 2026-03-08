import { useState, useMemo, useCallback } from 'react';
import { nodes, edges, getNodeById } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { motion } from 'framer-motion';

interface ScenarioChange {
  nodeId: string;
  deltaPercent: number; // -100 to +100
}

// Which nodes can be adjusted
const adjustableNodes = ['rainfall-deficit', 'transport-costs', 'currency-weakness', 'grain-supply'];

// Simplified propagation weights from edges
function propagateChanges(changes: ScenarioChange[]): Record<string, number> {
  const impacts: Record<string, number> = {};

  // Initialize with direct changes
  changes.forEach(c => {
    impacts[c.nodeId] = c.deltaPercent;
  });

  // Simple BFS propagation through edges
  const queue = changes.map(c => c.nodeId);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const outEdges = edges.filter(e => e.sourceId === current);
    outEdges.forEach(edge => {
      const sourceImpact = impacts[current] || 0;
      const propagated = sourceImpact * edge.influenceStrength * (edge.polarity === 'positive' ? 1 : -1);
      const existing = impacts[edge.targetId] || 0;
      impacts[edge.targetId] = existing + propagated;
      queue.push(edge.targetId);
    });
  }

  return impacts;
}

export default function ScenarioMode() {
  const [changes, setChanges] = useState<ScenarioChange[]>(
    adjustableNodes.map(id => ({ nodeId: id, deltaPercent: 0 }))
  );

  const handleSliderChange = useCallback((nodeId: string, value: number) => {
    setChanges(prev =>
      prev.map(c => (c.nodeId === nodeId ? { ...c, deltaPercent: value } : c))
    );
  }, []);

  const impacts = useMemo(() => propagateChanges(changes.filter(c => c.deltaPercent !== 0)), [changes]);
  const hasChanges = changes.some(c => c.deltaPercent !== 0);

  const resetAll = () => {
    setChanges(adjustableNodes.map(id => ({ nodeId: id, deltaPercent: 0 })));
  };

  // All nodes sorted by impact magnitude
  const impactedNodes = useMemo(() => {
    return nodes
      .filter(n => !adjustableNodes.includes(n.id) && impacts[n.id])
      .map(n => ({ node: n, impact: impacts[n.id] || 0 }))
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }, [impacts]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-1">Scenario Simulator</h2>
          <p className="text-xs text-muted-foreground">
            Adjust upstream variables and see how changes propagate
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={resetAll}
            className="text-[10px] font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Input sliders */}
        <div className="px-6 py-4 border-b border-border">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Adjust Variables
          </div>
          <div className="space-y-4">
            {changes.map(({ nodeId, deltaPercent }) => {
              const node = getNodeById(nodeId);
              if (!node) return null;
              const color = domainColors[node.domain];

              return (
                <div key={nodeId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{domainIcons[node.domain]}</span>
                      <span className="text-xs font-medium text-foreground">{node.label}</span>
                    </div>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{
                        color: deltaPercent > 0
                          ? 'hsl(0, 65%, 55%)'
                          : deltaPercent < 0
                          ? 'hsl(142, 50%, 45%)'
                          : 'hsl(215, 12%, 50%)',
                      }}
                    >
                      {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={deltaPercent}
                      onChange={(e) => handleSliderChange(nodeId, Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                          hsl(142, 50%, 45%) 0%, 
                          hsl(var(--muted)) 50%, 
                          hsl(0, 65%, 55%) 100%)`,
                      }}
                    />
                    {/* Center mark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-0.5 -translate-y-1/2 w-0.5 h-3 bg-muted-foreground/30 pointer-events-none" />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-0.5">
                    <span>-100% (improve)</span>
                    <span>+100% (worsen)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Propagated impacts */}
        <div className="px-6 py-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Propagated Effects {hasChanges ? `(${impactedNodes.length})` : ''}
          </div>

          {!hasChanges && (
            <div className="text-center py-8 text-muted-foreground text-xs">
              Move a slider above to see how changes propagate through the causal chain
            </div>
          )}

          <div className="space-y-2">
            {impactedNodes.map(({ node, impact }, i) => {
              const isNegative = impact < 0; // negative = improvement
              const absImpact = Math.abs(impact);
              const barWidth = Math.min(absImpact, 100);

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{domainIcons[node.domain]}</span>
                      <span className="text-xs font-medium text-foreground">{node.label}</span>
                    </div>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{
                        color: isNegative ? 'hsl(142, 50%, 45%)' : 'hsl(0, 65%, 55%)',
                      }}
                    >
                      {isNegative ? '↓' : '↑'} {Math.round(absImpact)}%
                    </span>
                  </div>

                  {/* Impact bar */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                      style={{
                        backgroundColor: isNegative ? 'hsl(142, 50%, 45%)' : 'hsl(0, 65%, 55%)',
                      }}
                    />
                  </div>

                  <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {isNegative ? 'Improvement' : 'Worsening'} · {node.severity} current severity
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Scenario summary */}
        {hasChanges && impactedNodes.length > 0 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">
                Scenario Summary
              </div>
              <p className="text-xs text-secondary-foreground leading-relaxed">
                {impactedNodes.filter(n => n.impact > 0).length > 0 && (
                  <>
                    {impactedNodes.filter(n => n.impact > 0).length} downstream factors would worsen.{' '}
                  </>
                )}
                {impactedNodes.filter(n => n.impact < 0).length > 0 && (
                  <>
                    {impactedNodes.filter(n => n.impact < 0).length} factors would improve.{' '}
                  </>
                )}
                Results are probabilistic estimates — actual outcomes depend on timing, 
                concurrent interventions, and system resilience.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

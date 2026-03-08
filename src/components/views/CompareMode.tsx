import { useState, useMemo } from 'react';
import { nodes, edges, getNodeById } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { motion } from 'framer-motion';

// Two "regions" for comparison
const regionA = {
  name: 'Nairobi, Kenya',
  chainNodeIds: ['rainfall-deficit', 'crop-output', 'grain-supply', 'grain-prices', 'food-stress', 'urban-dissatisfaction', 'protest-risk'],
};

const regionB = {
  name: 'Addis Ababa, Ethiopia',
  chainNodeIds: ['rainfall-deficit', 'crop-output', 'grain-supply', 'grain-prices', 'food-stress', 'urban-dissatisfaction'],
  // Simulated alternate values
  overrides: {
    'grain-prices': { currentValue: '+18% in 8 weeks', severity: 'high' as const },
    'food-stress': { currentValue: '1.1M affected', severity: 'high' as const },
    'urban-dissatisfaction': { currentValue: 'Grievance index: 48/100', severity: 'medium' as const },
  },
};

export default function CompareMode() {
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const sharedNodes = useMemo(
    () => regionA.chainNodeIds.filter(id => regionB.chainNodeIds.includes(id)),
    []
  );
  const uniqueA = regionA.chainNodeIds.filter(id => !regionB.chainNodeIds.includes(id));
  const uniqueB = regionB.chainNodeIds.filter(id => !regionA.chainNodeIds.includes(id));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <h2 className="text-sm font-semibold text-foreground mb-1">Compare Causal Chains</h2>
        <p className="text-xs text-muted-foreground">
          Side-by-side comparison of causal pathways between two regions
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Region headers */}
        <div className="grid grid-cols-2 border-b border-border sticky top-0 bg-background z-10">
          <div className="px-6 py-3 border-r border-border">
            <div className="text-xs font-mono uppercase tracking-wider text-primary">{regionA.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{regionA.chainNodeIds.length} nodes in chain</div>
          </div>
          <div className="px-6 py-3">
            <div className="text-xs font-mono uppercase tracking-wider text-domain-economics">{regionB.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{regionB.chainNodeIds.length} nodes in chain</div>
          </div>
        </div>

        {/* Shared nodes comparison */}
        <div className="px-6 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Shared Causal Factors ({sharedNodes.length})
          </div>

          <div className="space-y-2">
            {sharedNodes.map((nodeId, i) => {
              const node = getNodeById(nodeId);
              if (!node) return null;
              const override = (regionB.overrides as any)[nodeId];
              const bValue = override?.currentValue || node.currentValue;
              const bSeverity = override?.severity || node.severity;

              return (
                <motion.div
                  key={nodeId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-2 rounded-lg border transition-colors cursor-pointer ${
                    selectedPair === nodeId ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => setSelectedPair(selectedPair === nodeId ? null : nodeId)}
                >
                  {/* Region A */}
                  <div className="p-3 border-r border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{domainIcons[node.domain]}</span>
                      <span className="text-xs font-medium text-foreground">{node.label}</span>
                    </div>
                    <div className="text-xs font-mono" style={{ color: domainColors[node.domain] }}>
                      {node.currentValue}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: severityColors[node.severity] }} />
                      <span className="text-[10px] text-muted-foreground capitalize">{node.severity}</span>
                    </div>
                  </div>

                  {/* Region B */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{domainIcons[node.domain]}</span>
                      <span className="text-xs font-medium text-foreground">{node.label}</span>
                    </div>
                    <div className="text-xs font-mono" style={{ color: domainColors[node.domain] }}>
                      {bValue}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: severityColors[bSeverity] }} />
                      <span className="text-[10px] text-muted-foreground capitalize">{bSeverity}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Unique to each */}
        <div className="px-6 py-3 grid grid-cols-2 gap-4">
          {/* Unique to A */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Unique to {regionA.name} ({uniqueA.length})
            </div>
            {uniqueA.map(id => {
              const node = getNodeById(id);
              if (!node) return null;
              return (
                <div key={id} className="p-2.5 rounded-lg bg-card border border-border mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{domainIcons[node.domain]}</span>
                    <span className="text-xs font-medium text-foreground">{node.label}</span>
                  </div>
                  <div className="text-[10px] font-mono mt-1" style={{ color: severityColors[node.severity] }}>
                    {node.currentValue}
                  </div>
                </div>
              );
            })}
            {uniqueA.length === 0 && (
              <div className="text-xs text-muted-foreground">All factors shared</div>
            )}
          </div>

          {/* Unique to B */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Unique to {regionB.name} ({uniqueB.length})
            </div>
            {uniqueB.length === 0 && (
              <div className="text-xs text-muted-foreground">All factors shared</div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 border-t border-border">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">Comparison Insight</div>
            <p className="text-xs text-secondary-foreground leading-relaxed">
              Both regions share the climate-agriculture-price causal chain, but Nairobi shows significantly higher food stress (2.4M vs 1.1M affected) 
              and elevated protest risk (68% probability) that is absent from the Addis Ababa chain. The divergence appears driven by 
              higher grain price inflation (+34% vs +18%) and stronger grievance amplification in Nairobi's informal settlements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

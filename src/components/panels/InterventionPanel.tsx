import { interventions, getNodeById } from '@/data/causalData';
import { domainIcons } from '@/lib/domainUtils';
import { motion } from 'framer-motion';

const costColors = {
  low: 'hsl(142, 50%, 45%)',
  medium: 'hsl(38, 80%, 55%)',
  high: 'hsl(0, 72%, 55%)',
};

const confidenceWidth = {
  high: '85%',
  medium: '55%',
  low: '30%',
};

export default function InterventionPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Intervention Simulator
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Test actions to break the causal chain
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {interventions.map((int, i) => {
          const targets = int.targetNodeIds.map(id => getNodeById(id)).filter(Boolean);
          
          return (
            <motion.div
              key={int.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">⚡ {int.label}</h4>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: `${costColors[int.costBand]}22`,
                    color: costColors[int.costBand],
                  }}
                >
                  {int.costBand} cost
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {int.description}
              </p>

              {/* Impact bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                  <span>Est. Impact</span>
                  <span>{Math.round(int.estimatedImpact * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${int.estimatedImpact * 100}%` }}
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground mb-2">
                <span>⏱ {int.timeToEffect}</span>
                <span>📊 {int.confidence} conf.</span>
              </div>

              {/* Targets */}
              <div className="flex flex-wrap gap-1 mb-2">
                {targets.map(t => t && (
                  <span
                    key={t.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-secondary-foreground"
                  >
                    {domainIcons[t.domain]} {t.label}
                  </span>
                ))}
              </div>

              {/* Risks */}
              {int.risks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase">Risks</div>
                  <div className="flex flex-wrap gap-1">
                    {int.risks.map((r, j) => (
                      <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

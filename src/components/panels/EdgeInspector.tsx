import { useDashboardStore } from '@/store/dashboardStore';
import { edges, getNodeById } from '@/data/causalData';
import { domainColors, domainIcons } from '@/lib/domainUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AnnotationsPanel from '@/components/panels/AnnotationsPanel';

export default function EdgeInspector() {
  const { selectedEdgeId, setSelectedEdge } = useDashboardStore();
  const edge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null;

  if (!edge) return null;

  const source = getNodeById(edge.sourceId);
  const target = getNodeById(edge.targetId);
  if (!source || !target) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={edge.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="h-full flex flex-col border-l border-border bg-card overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Causal Link
            </h3>
            <button
              onClick={() => setSelectedEdge(null)}
              className="p-1 rounded hover:bg-accent text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{domainIcons[source.domain]}</span>
            <span className="font-medium text-foreground">{source.label}</span>
            <span className="text-muted-foreground">→</span>
            <span>{domainIcons[target.domain]}</span>
            <span className="font-medium text-foreground">{target.label}</span>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* Mechanism */}
          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1.5">Mechanism</div>
            <p className="text-xs text-secondary-foreground leading-relaxed">{edge.mechanism}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Strength</div>
              <div className="text-sm font-semibold text-foreground mt-0.5">
                {Math.round(edge.influenceStrength * 100)}%
              </div>
              <div className="h-1 rounded-full bg-background mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${edge.influenceStrength * 100}%`,
                    backgroundColor: 'hsl(38, 80%, 55%)',
                  }}
                />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Confidence</div>
              <div className="text-sm font-medium capitalize text-foreground mt-0.5">{edge.confidence}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Time Lag</div>
              <div className="text-sm font-medium text-foreground mt-0.5">{edge.lagMin}–{edge.lagMax} weeks</div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Link Type</div>
              <div className="text-sm font-medium capitalize text-foreground mt-0.5">{edge.directness}</div>
            </div>
          </div>

          {/* Method */}
          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1.5">Method</div>
            <div className="px-2.5 py-1.5 rounded bg-muted text-xs font-mono text-secondary-foreground">
              {edge.methodType}
            </div>
          </div>

          {/* Evidence sources */}
          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1.5">
              Evidence Sources ({edge.evidenceSources.length})
            </div>
            <div className="space-y-1">
              {edge.evidenceSources.map((src, i) => (
                <div key={i} className="px-2.5 py-1.5 rounded bg-muted text-xs text-secondary-foreground flex items-center gap-2">
                  <span className="text-primary">•</span>
                  {src}
                </div>
              ))}
            </div>
          </div>

          {/* Confounders */}
          {edge.confounders.length > 0 && (
            <div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1.5">
                Possible Confounders
              </div>
              <div className="space-y-1">
                {edge.confounders.map((c, i) => (
                  <div key={i} className="px-2.5 py-1.5 rounded bg-muted text-xs text-secondary-foreground flex items-center gap-2">
                    <span className="text-severity-medium">⚠</span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternate hypotheses */}
          {edge.alternateHypotheses.length > 0 && (
            <div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1.5">
                Alternative Explanations
              </div>
              <div className="space-y-1">
                {edge.alternateHypotheses.map((h, i) => (
                  <div key={i} className="px-2.5 py-1.5 rounded border border-border bg-card text-xs text-secondary-foreground leading-relaxed">
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

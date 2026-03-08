import { useState, useMemo, useCallback } from 'react';
import { nodes, edges, getNodeById } from '@/data/causalData';
import { domainColors, domainIcons, severityColors } from '@/lib/domainUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, GitCompare, Plus, Eye } from 'lucide-react';

interface ScenarioChange {
  nodeId: string;
  deltaPercent: number;
}

interface SavedScenario {
  id: string;
  name: string;
  changes: ScenarioChange[];
  timestamp: number;
}

const adjustableNodes = ['rainfall-deficit', 'transport-costs', 'currency-weakness', 'grain-supply'];

function propagateChanges(changes: ScenarioChange[]): Record<string, number> {
  const impacts: Record<string, number> = {};
  changes.forEach(c => { impacts[c.nodeId] = c.deltaPercent; });
  const queue = changes.map(c => c.nodeId);
  const visited = new Set<string>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    edges.filter(e => e.sourceId === current).forEach(edge => {
      const sourceImpact = impacts[current] || 0;
      const propagated = sourceImpact * edge.influenceStrength * (edge.polarity === 'positive' ? 1 : -1);
      impacts[edge.targetId] = (impacts[edge.targetId] || 0) + propagated;
      queue.push(edge.targetId);
    });
  }
  return impacts;
}

export default function CompareMode() {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [currentChanges, setCurrentChanges] = useState<ScenarioChange[]>(
    adjustableNodes.map(id => ({ nodeId: id, deltaPercent: 0 }))
  );
  const [scenarioName, setScenarioName] = useState('');
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null);
  const [mode, setMode] = useState<'build' | 'compare'>('build');

  const handleSliderChange = useCallback((nodeId: string, value: number) => {
    setCurrentChanges(prev => prev.map(c => c.nodeId === nodeId ? { ...c, deltaPercent: value } : c));
  }, []);

  const saveScenario = () => {
    if (!scenarioName.trim()) return;
    const s: SavedScenario = {
      id: crypto.randomUUID(),
      name: scenarioName.trim(),
      changes: currentChanges.filter(c => c.deltaPercent !== 0),
      timestamp: Date.now(),
    };
    setSavedScenarios(prev => [...prev, s]);
    setScenarioName('');
    setCurrentChanges(adjustableNodes.map(id => ({ nodeId: id, deltaPercent: 0 })));
  };

  const deleteScenario = (id: string) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id));
    if (compareIds && (compareIds[0] === id || compareIds[1] === id)) setCompareIds(null);
  };

  const startCompare = (id1: string, id2: string) => {
    setCompareIds([id1, id2]);
    setMode('compare');
  };

  // Comparison data
  const comparisonData = useMemo(() => {
    if (!compareIds) return null;
    const s1 = savedScenarios.find(s => s.id === compareIds[0]);
    const s2 = savedScenarios.find(s => s.id === compareIds[1]);
    if (!s1 || !s2) return null;
    const impacts1 = propagateChanges(s1.changes);
    const impacts2 = propagateChanges(s2.changes);
    const allNodeIds = new Set([...Object.keys(impacts1), ...Object.keys(impacts2)]);
    const rows = Array.from(allNodeIds)
      .filter(id => !adjustableNodes.includes(id))
      .map(id => ({
        node: getNodeById(id)!,
        impact1: impacts1[id] || 0,
        impact2: impacts2[id] || 0,
        diff: (impacts2[id] || 0) - (impacts1[id] || 0),
      }))
      .filter(r => r.node && (Math.abs(r.impact1) > 0.5 || Math.abs(r.impact2) > 0.5))
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    return { s1, s2, rows };
  }, [compareIds, savedScenarios]);

  const hasChanges = currentChanges.some(c => c.deltaPercent !== 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-1">Compare Scenarios</h2>
          <p className="text-xs text-muted-foreground">
            Save scenario configurations and compare their downstream effects
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('build')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'build' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus size={12} className="inline mr-1" />Build
          </button>
          <button
            onClick={() => setMode('compare')}
            disabled={savedScenarios.length < 2}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-30 ${
              mode === 'compare' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GitCompare size={12} className="inline mr-1" />Compare
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {mode === 'build' && (
          <>
            {/* Slider inputs */}
            <div className="px-6 py-4 border-b border-border">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Configure Scenario
              </div>
              <div className="space-y-4">
                {currentChanges.map(({ nodeId, deltaPercent }) => {
                  const node = getNodeById(nodeId);
                  if (!node) return null;
                  return (
                    <div key={nodeId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{domainIcons[node.domain]}</span>
                          <span className="text-xs font-medium text-foreground">{node.label}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold" style={{
                          color: deltaPercent > 0 ? 'hsl(var(--destructive))' : deltaPercent < 0 ? 'hsl(var(--severity-low))' : 'hsl(var(--muted-foreground))',
                        }}>
                          {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
                        </span>
                      </div>
                      <input
                        type="range" min={-100} max={100} value={deltaPercent}
                        onChange={(e) => handleSliderChange(nodeId, Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--severity-low)) 0%, hsl(var(--muted)) 50%, hsl(var(--destructive)) 100%)`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Save */}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={scenarioName}
                  onChange={e => setScenarioName(e.target.value)}
                  placeholder="Scenario name…"
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={saveScenario}
                  disabled={!hasChanges || !scenarioName.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30"
                >
                  <Save size={12} /> Save
                </button>
              </div>
            </div>

            {/* Saved scenarios list */}
            <div className="px-6 py-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Saved Scenarios ({savedScenarios.length})
              </div>
              {savedScenarios.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  Configure sliders above and save to create scenarios for comparison
                </div>
              )}
              <div className="space-y-2">
                {savedScenarios.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">{s.name}</span>
                      <button onClick={() => deleteScenario(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.changes.map(c => {
                        const n = getNodeById(c.nodeId);
                        return (
                          <span key={c.nodeId} className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                            {n?.label}: {c.deltaPercent > 0 ? '+' : ''}{c.deltaPercent}%
                          </span>
                        );
                      })}
                    </div>
                    {savedScenarios.length >= 2 && (
                      <div className="mt-2 flex gap-1">
                        {savedScenarios.filter(o => o.id !== s.id).map(o => (
                          <button
                            key={o.id}
                            onClick={() => startCompare(s.id, o.id)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye size={10} /> vs {o.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'compare' && comparisonData && (
          <div className="px-6 py-4">
            {/* Scenario headers */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">Scenario A</div>
                <div className="text-xs font-semibold text-foreground">{comparisonData.s1.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {comparisonData.s1.changes.map(c => (
                    <span key={c.nodeId} className="text-[9px] font-mono text-muted-foreground">
                      {getNodeById(c.nodeId)?.label}: {c.deltaPercent > 0 ? '+' : ''}{c.deltaPercent}%
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-accent/30">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Scenario B</div>
                <div className="text-xs font-semibold text-foreground">{comparisonData.s2.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {comparisonData.s2.changes.map(c => (
                    <span key={c.nodeId} className="text-[9px] font-mono text-muted-foreground">
                      {getNodeById(c.nodeId)?.label}: {c.deltaPercent > 0 ? '+' : ''}{c.deltaPercent}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Diff table */}
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Downstream Impact Comparison ({comparisonData.rows.length} factors)
            </div>
            <div className="space-y-2">
              {comparisonData.rows.map(({ node, impact1, impact2, diff }, i) => {
                const absDiff = Math.abs(diff);
                const diffColor = diff > 0 ? 'hsl(var(--destructive))' : diff < 0 ? 'hsl(var(--severity-low))' : 'hsl(var(--muted-foreground))';
                const highlightClass = absDiff > 10 ? 'border-primary/30 bg-primary/5' : 'border-border';

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`p-3 rounded-lg border ${highlightClass} bg-card`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{domainIcons[node.domain]}</span>
                      <span className="text-xs font-medium text-foreground flex-1">{node.label}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: diffColor }}>
                        Δ {diff > 0 ? '+' : ''}{Math.round(diff)}%
                      </span>
                    </div>

                    {/* Side-by-side bars */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[9px] font-mono text-primary mb-0.5">A: {impact1 > 0 ? '+' : ''}{Math.round(impact1)}%</div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(Math.abs(impact1), 100)}%` }}
                            style={{ backgroundColor: impact1 > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--severity-low))' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-muted-foreground mb-0.5">B: {impact2 > 0 ? '+' : ''}{Math.round(impact2)}%</div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(Math.abs(impact2), 100)}%` }}
                            style={{ backgroundColor: impact2 > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--severity-low))' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary */}
            {comparisonData.rows.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">Comparison Insight</div>
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  {(() => {
                    const better = comparisonData.rows.filter(r => r.diff < -1).length;
                    const worse = comparisonData.rows.filter(r => r.diff > 1).length;
                    const maxDiff = comparisonData.rows[0];
                    return `Scenario B ${better > worse ? 'outperforms' : 'underperforms'} Scenario A on ${Math.max(better, worse)} of ${comparisonData.rows.length} downstream factors. The largest divergence is in ${maxDiff?.node.label} (Δ${Math.round(maxDiff?.diff)}%).`;
                  })()}
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'compare' && !comparisonData && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <GitCompare size={28} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Select scenarios to compare</p>
              <p className="text-xs text-muted-foreground">
                {savedScenarios.length < 2
                  ? 'Save at least 2 scenarios in Build mode to compare them'
                  : 'Go to Build mode and click "vs" on a saved scenario'}
              </p>
            </div>
            {savedScenarios.length < 2 && (
              <button onClick={() => setMode('build')} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
                Build Scenarios
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

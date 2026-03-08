import { useState, useMemo, useRef } from 'react';
import { nodes, edges, getNodeById, getDownstreamNodes, interventions } from '@/data/causalData';
import { domainIcons, domainColors, severityColors } from '@/lib/domainUtils';
import { Shield, Loader2, Lightbulb, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-causal`;

interface ChainBreakNode {
  id: string;
  label: string;
  domain: string;
  icon: string;
  severity: string;
  severityColor: string;
  interventionEligible: boolean;
  downstreamReach: number;
  totalInfluence: number;
  breakScore: number;
  matchingInterventions: typeof interventions;
}

export default function BreakTheChainView() {
  const [selectedBreakNode, setSelectedBreakNode] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const breakNodes: ChainBreakNode[] = useMemo(() => {
    return nodes
      .filter(n => n.interventionEligible)
      .map(node => {
        const outEdges = edges.filter(e => e.sourceId === node.id);
        const totalInfluence = outEdges.reduce((s, e) => s + e.influenceStrength, 0);
        const downstream = getDownstreamNodes(node.id);
        const downstreamReach = downstream.length;
        // Break score: how much damage we prevent by intervening here
        const breakScore = totalInfluence * (1 + downstreamReach * 0.3) * (node.severity === 'critical' ? 1.5 : node.severity === 'high' ? 1.2 : 1);
        const matchingInterventions = interventions.filter(i => i.targetNodeIds.includes(node.id));

        return {
          id: node.id,
          label: node.label,
          domain: node.domain,
          icon: domainIcons[node.domain],
          severity: node.severity,
          severityColor: severityColors[node.severity],
          interventionEligible: true,
          downstreamReach,
          totalInfluence: Math.round(totalInfluence * 100) / 100,
          breakScore: Math.round(breakScore * 100) / 100,
          matchingInterventions,
        };
      })
      .sort((a, b) => b.breakScore - a.breakScore);
  }, []);

  const handleGetRecommendation = async (nodeId: string) => {
    if (selectedBreakNode === nodeId && recommendation) {
      setSelectedBreakNode(null);
      setRecommendation('');
      return;
    }

    setSelectedBreakNode(nodeId);
    setRecommendation('');
    setIsLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const node = getNodeById(nodeId);
      if (!node) return;
      const downstream = getDownstreamNodes(nodeId).map(n => n.label);
      const matchingInts = interventions.filter(i => i.targetNodeIds.includes(nodeId));

      const resp = await fetch(EXPLAIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'break_chain',
          context: {
            ...node,
            downstreamNodes: downstream,
            availableInterventions: matchingInts.map(i => ({
              label: i.label,
              estimatedImpact: i.estimatedImpact,
              timeToEffect: i.timeToEffect,
              costBand: i.costBand,
              risks: i.risks,
            })),
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        setRecommendation(`⚠️ ${err.error || 'Failed to generate recommendation'}`);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              text += content;
              setRecommendation(text);
            }
          } catch { /* partial */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setRecommendation('⚠️ Failed to generate recommendation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Break the Chain</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Nodes ranked by intervention efficiency — where breaking the chain prevents the most downstream harm
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {breakNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`rounded-lg border transition-all ${
                selectedBreakNode === node.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${domainColors[node.domain as keyof typeof domainColors]}22`, color: domainColors[node.domain as keyof typeof domainColors] }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{node.icon}</span>
                        <span className="text-sm font-semibold text-foreground">{node.label}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: node.severityColor }} />
                          <span className="text-muted-foreground capitalize">{node.severity}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Break Score</div>
                    <div className="text-lg font-bold text-primary">{node.breakScore}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 rounded bg-muted text-center">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">Influence</div>
                    <div className="text-xs font-semibold text-foreground">{node.totalInfluence}</div>
                  </div>
                  <div className="p-2 rounded bg-muted text-center">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">Downstream</div>
                    <div className="text-xs font-semibold text-foreground">{node.downstreamReach}</div>
                  </div>
                  <div className="p-2 rounded bg-muted text-center">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">Interventions</div>
                    <div className="text-xs font-semibold text-foreground">{node.matchingInterventions.length}</div>
                  </div>
                </div>

                {/* Interventions tags */}
                {node.matchingInterventions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {node.matchingInterventions.map(int => (
                      <span
                        key={int.id}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        <Zap size={8} />
                        {int.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI recommendation button */}
                <button
                  onClick={() => handleGetRecommendation(node.id)}
                  disabled={isLoading && selectedBreakNode === node.id}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {isLoading && selectedBreakNode === node.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Lightbulb size={12} />
                  )}
                  {selectedBreakNode === node.id && recommendation ? 'Hide Recommendation' : 'AI Recommendation'}
                </button>
              </div>

              {/* AI Recommendation */}
              <AnimatePresence>
                {selectedBreakNode === node.id && recommendation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 max-h-64 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb size={12} className="text-primary" />
                          <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
                            AI Strategy
                          </span>
                        </div>
                        <div className="text-xs text-secondary-foreground leading-relaxed prose prose-xs prose-invert max-w-none">
                          <ReactMarkdown>{recommendation}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

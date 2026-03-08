import { useState, useRef } from 'react';
import { nodes, edges, interventions, chainSummary } from '@/data/causalData';
import { domainIcons, severityColors } from '@/lib/domainUtils';
import { FileText, Loader2, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-causal`;

export default function PolicyBriefingView() {
  const [briefing, setBriefing] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generateBriefing = async () => {
    setBriefing('');
    setIsLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const criticalNodes = nodes.filter(n => n.severity === 'critical');
      const highNodes = nodes.filter(n => n.severity === 'high');
      const topInterventions = interventions.slice(0, 5);

      const resp = await fetch(EXPLAIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'policy_briefing',
          context: {
            chainSummary,
            totalNodes: nodes.length,
            totalEdges: edges.length,
            criticalFactors: criticalNodes.map(n => ({
              label: n.label, domain: n.domain, currentValue: n.currentValue, changeDelta: n.changeDelta,
            })),
            highRiskFactors: highNodes.map(n => ({
              label: n.label, domain: n.domain, currentValue: n.currentValue,
            })),
            topInterventions: topInterventions.map(i => ({
              label: i.label, estimatedImpact: i.estimatedImpact, timeToEffect: i.timeToEffect,
              costBand: i.costBand, risks: i.risks,
            })),
            interventionEligibleCount: nodes.filter(n => n.interventionEligible).length,
            domainBreakdown: Object.entries(
              nodes.reduce((acc, n) => { acc[n.domain] = (acc[n.domain] || 0) + 1; return acc; }, {} as Record<string, number>)
            ),
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        setBriefing(`⚠️ ${err.error || 'Failed to generate briefing'}`);
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
            if (content) { text += content; setBriefing(text); }
          } catch { /* partial */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setBriefing('⚠️ Failed to generate policy briefing.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const criticalCount = nodes.filter(n => n.severity === 'critical').length;
  const highCount = nodes.filter(n => n.severity === 'high').length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">What Would You Do?</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              AI-generated policy briefing with executive summary, risk assessment, and action plan
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-6 py-3 border-b border-border flex gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-destructive/10">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors.critical }} />
          <span className="text-[10px] font-mono text-destructive">{criticalCount} Critical</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors.high }} />
          <span className="text-[10px] font-mono text-foreground">{highCount} High</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted">
          <span className="text-[10px] font-mono text-muted-foreground">{nodes.length} nodes · {edges.length} links · {interventions.length} interventions</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!briefing && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Generate Policy Briefing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Atlas will analyze the full causal chain — {nodes.length} factors across {
                  new Set(nodes.map(n => n.domain)).size
                } domains — and produce a structured policy briefing with executive summary, 
                risk assessment, and prioritized action plan.
              </p>
            </div>
            <button
              onClick={generateBriefing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <FileText size={14} />
              Generate Briefing
            </button>
          </div>
        )}

        {isLoading && !briefing && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Analyzing causal chain and generating briefing…</span>
          </div>
        )}

        <AnimatePresence>
          {briefing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">Policy Briefing</span>
                  {isLoading && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateBriefing}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={10} />
                    Regenerate
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([briefing], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'atlas-policy-briefing.md'; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <Download size={10} />
                    Export .md
                  </button>
                </div>
              </div>

              {/* Briefing content */}
              <div className="p-6 rounded-xl border border-primary/15 bg-card">
                <div className="prose prose-sm prose-invert max-w-none text-secondary-foreground leading-relaxed">
                  <ReactMarkdown>{briefing}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

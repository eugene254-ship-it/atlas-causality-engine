import { useDashboardStore } from '@/store/dashboardStore';
import { getNodeById, getUpstreamNodes, getDownstreamNodes, edges } from '@/data/causalData';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-causal`;

export default function ExplainThisButton() {
  const { selectedNodeId, selectedEdgeId } = useDashboardStore();
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastExplainedId, setLastExplainedId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentId = selectedNodeId || selectedEdgeId;
  if (!currentId) return null;

  const handleExplain = async () => {
    if (showExplanation && currentId === lastExplainedId) {
      setShowExplanation(false);
      return;
    }

    setShowExplanation(true);
    setExplanation('');
    setIsLoading(true);
    setLastExplainedId(currentId);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      let body: { type: string; context: Record<string, unknown> };

      if (selectedNodeId) {
        const node = getNodeById(selectedNodeId);
        if (!node) return;
        const upstream = getUpstreamNodes(selectedNodeId).map(n => n.label);
        const downstream = getDownstreamNodes(selectedNodeId).map(n => n.label);
        body = {
          type: 'node',
          context: { ...node, upstreamNodes: upstream, downstreamNodes: downstream },
        };
      } else {
        const edge = edges.find(e => e.id === selectedEdgeId);
        if (!edge) return;
        const sourceNode = getNodeById(edge.sourceId);
        const targetNode = getNodeById(edge.targetId);
        body = {
          type: 'edge',
          context: { ...edge, sourceLabel: sourceNode?.label, targetLabel: targetNode?.label },
        };
      }

      const resp = await fetch(EXPLAIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        setExplanation(`⚠️ ${err.error || 'Failed to generate explanation'}`);
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
              setExplanation(text);
            }
          } catch { /* partial */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setExplanation('⚠️ Failed to generate explanation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-border">
      <button
        onClick={handleExplain}
        disabled={isLoading}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Lightbulb size={13} />}
        {showExplanation && currentId === lastExplainedId ? 'Hide Explanation' : 'Explain This'}
      </button>

      <AnimatePresence>
        {showExplanation && explanation && (
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
                    AI Analysis
                  </span>
                </div>
                <div className="text-xs text-secondary-foreground leading-relaxed prose prose-xs prose-invert max-w-none">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

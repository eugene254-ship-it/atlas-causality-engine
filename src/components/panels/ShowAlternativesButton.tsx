import { useDashboardStore } from '@/store/dashboardStore';
import { edges, getNodeById } from '@/data/causalData';
import { GitFork, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-causal`;

export default function ShowAlternativesButton() {
  const { selectedEdgeId } = useDashboardStore();
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  if (!selectedEdgeId) return null;

  const handleClick = async () => {
    if (showAlternatives && selectedEdgeId === lastId) {
      setShowAlternatives(false);
      return;
    }

    setShowAlternatives(true);
    setAlternatives('');
    setIsLoading(true);
    setLastId(selectedEdgeId);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const edge = edges.find(e => e.id === selectedEdgeId);
      if (!edge) return;
      const sourceNode = getNodeById(edge.sourceId);
      const targetNode = getNodeById(edge.targetId);

      const resp = await fetch(EXPLAIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'alternatives',
          context: {
            ...edge,
            sourceLabel: sourceNode?.label,
            targetLabel: targetNode?.label,
            sourceDomain: sourceNode?.domain,
            targetDomain: targetNode?.domain,
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        setAlternatives(`⚠️ ${err.error || 'Failed to generate alternatives'}`);
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
              setAlternatives(text);
            }
          } catch { /* partial */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setAlternatives('⚠️ Failed to generate alternatives. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-border">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-accent-foreground hover:bg-accent/50 transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={13} className="animate-spin" /> : <GitFork size={13} />}
        {showAlternatives && selectedEdgeId === lastId ? 'Hide Alternatives' : 'Show Alternatives'}
      </button>

      <AnimatePresence>
        {showAlternatives && alternatives && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-accent/30 border border-accent max-h-64 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <GitFork size={12} className="text-accent-foreground" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent-foreground">
                    Competing Hypotheses
                  </span>
                </div>
                <div className="text-xs text-secondary-foreground leading-relaxed prose prose-xs prose-invert max-w-none">
                  <ReactMarkdown>{alternatives}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

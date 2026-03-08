import { useState, useMemo } from 'react';
import { nodes } from '@/data/causalData';
import { domainIcons, severityColors } from '@/lib/domainUtils';
import { AlertTriangle, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-causal`;

interface Anomaly {
  nodeId: string;
  type: 'spike' | 'drop' | 'inflection' | 'plateau';
  month: number;
  magnitude: number;
  description: string;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function detectAnomalies(): Anomaly[] {
  const anomalies: Anomaly[] = [];

  nodes.forEach(node => {
    const data = node.trendData;
    if (data.length < 3) return;

    for (let i = 1; i < data.length - 1; i++) {
      const prev = data[i - 1];
      const curr = data[i];
      const next = data[i + 1];
      const avgNeighbor = (prev + next) / 2;
      const deviation = Math.abs(curr - avgNeighbor);
      const range = Math.max(...data) - Math.min(...data) || 1;
      const relDeviation = deviation / range;

      // Spike/drop detection
      if (relDeviation > 0.35) {
        const magnitude = Math.round(relDeviation * 100);
        if (curr > avgNeighbor) {
          anomalies.push({
            nodeId: node.id, type: 'spike', month: i, magnitude,
            description: `${node.label} shows an unusual spike in ${months[i]} (${curr}% vs expected ~${Math.round(avgNeighbor)}%)`,
          });
        } else {
          anomalies.push({
            nodeId: node.id, type: 'drop', month: i, magnitude,
            description: `${node.label} shows an unexpected drop in ${months[i]} (${curr}% vs expected ~${Math.round(avgNeighbor)}%)`,
          });
        }
      }

      // Inflection point detection
      const prevSlope = curr - prev;
      const nextSlope = next - curr;
      if ((prevSlope > 3 && nextSlope < -3) || (prevSlope < -3 && nextSlope > 3)) {
        const magnitude = Math.round(Math.abs(prevSlope - nextSlope));
        anomalies.push({
          nodeId: node.id, type: 'inflection', month: i, magnitude,
          description: `${node.label} has an inflection point in ${months[i]} — trend reversal from ${prevSlope > 0 ? 'rising' : 'falling'} to ${nextSlope > 0 ? 'rising' : 'falling'}`,
        });
      }
    }

    // Plateau detection
    const lastThree = data.slice(-3);
    const plateauRange = Math.max(...lastThree) - Math.min(...lastThree);
    if (plateauRange < 2 && data[data.length - 1] > 50) {
      anomalies.push({
        nodeId: node.id, type: 'plateau', month: data.length - 1, magnitude: Math.round(data[data.length - 1]),
        description: `${node.label} has plateaued at a high level (~${Math.round(data[data.length - 1])}%) for the last 3 months`,
      });
    }
  });

  return anomalies.sort((a, b) => b.magnitude - a.magnitude);
}

const anomalyStyles = {
  spike: { icon: '📈', label: 'Spike', color: 'hsl(var(--destructive))' },
  drop: { icon: '📉', label: 'Drop', color: 'hsl(var(--severity-low))' },
  inflection: { icon: '🔄', label: 'Inflection', color: 'hsl(var(--domain-economics))' },
  plateau: { icon: '➡️', label: 'Plateau', color: 'hsl(var(--domain-infrastructure))' },
};

export default function AnomalyDetectionView() {
  const anomalies = useMemo(() => detectAnomalies(), []);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeAnomaly = async (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setAiAnalysis('');
    setIsLoading(true);

    try {
      const node = nodes.find(n => n.id === anomaly.nodeId);
      if (!node) return;

      const resp = await fetch(EXPLAIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'anomaly_analysis',
          context: {
            nodeLabel: node.label,
            domain: node.domain,
            anomalyType: anomaly.type,
            month: months[anomaly.month],
            magnitude: anomaly.magnitude,
            trendData: node.trendData.map((v, i) => `${months[i]}: ${v}%`).join(', '),
            description: anomaly.description,
            severity: node.severity,
            currentValue: node.currentValue,
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!resp.ok || !resp.body) {
        setAiAnalysis('⚠️ Failed to analyze anomaly');
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
            if (content) { text += content; setAiAnalysis(text); }
          } catch { /* partial */ }
        }
      }
    } catch {
      setAiAnalysis('⚠️ Analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const typeGroups = anomalies.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Anomaly Detection</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Automated monitoring of trend data across all nodes for unusual patterns
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 py-3 border-b border-border flex gap-2 flex-wrap">
        {Object.entries(typeGroups).map(([type, count]) => {
          const style = anomalyStyles[type as keyof typeof anomalyStyles];
          return (
            <div key={type} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted">
              <span className="text-xs">{style.icon}</span>
              <span className="text-[10px] font-mono" style={{ color: style.color }}>{count} {style.label}s</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10">
          <span className="text-[10px] font-mono text-primary">{anomalies.length} total anomalies</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Anomaly list */}
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <div className="px-4 py-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Detected Anomalies
            </div>
            <div className="space-y-1.5">
              {anomalies.map((a, i) => {
                const node = nodes.find(n => n.id === a.nodeId);
                const style = anomalyStyles[a.type];
                const isSelected = selectedAnomaly === a;

                return (
                  <motion.button
                    key={`${a.nodeId}-${a.type}-${a.month}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => analyzeAnomaly(a)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-border/80 bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{style.icon}</span>
                      <span className="text-xs font-medium text-foreground">{node?.label}</span>
                      <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ color: style.color, backgroundColor: `${style.color}15` }}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{a.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-mono text-muted-foreground">{months[a.month]} 2025</span>
                      <span className="text-[9px] font-mono" style={{ color: style.color }}>
                        Magnitude: {a.magnitude}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Analysis panel */}
        <div className="w-1/2 overflow-y-auto">
          {!selectedAnomaly && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <Zap size={24} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Click an anomaly to get AI-powered analysis of the pattern
              </p>
            </div>
          )}

          {isLoading && !aiAnalysis && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Analyzing anomaly…</span>
            </div>
          )}

          <AnimatePresence>
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={12} className="text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary">AI Analysis</span>
                  {isLoading && <Loader2 size={10} className="animate-spin text-muted-foreground" />}
                </div>
                <div className="p-4 rounded-lg border border-primary/15 bg-card">
                  <div className="prose prose-sm prose-invert max-w-none text-secondary-foreground leading-relaxed text-xs">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

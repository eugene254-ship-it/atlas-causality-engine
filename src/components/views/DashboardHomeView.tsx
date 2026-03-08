import { useState, useEffect, useMemo } from 'react';
import { nodes, edges, interventions } from '@/data/causalData';
import { useDashboardStore } from '@/store/dashboardStore';
import { supabase } from '@/integrations/supabase/client';
import { domainIcons } from '@/lib/domainUtils';
import { motion } from 'framer-motion';
import {
  Eye, GitCompare, FlaskConical, BarChart3, Shield, Map, FileText, Radar, Database,
  AlertTriangle, Activity, TrendingUp, MessageSquarePlus, Zap, GitBranch
} from 'lucide-react';

interface Annotation {
  id: string;
  target_type: string;
  target_id: string;
  content: string;
  author_name: string;
  color: string;
  created_at: string;
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function detectTopAnomalies() {
  const anomalies: { nodeId: string; type: string; description: string; magnitude: number }[] = [];
  nodes.forEach(node => {
    const data = node.trendData;
    if (data.length < 3) return;
    for (let i = 1; i < data.length - 1; i++) {
      const avg = (data[i - 1] + data[i + 1]) / 2;
      const range = Math.max(...data) - Math.min(...data) || 1;
      const rel = Math.abs(data[i] - avg) / range;
      if (rel > 0.35) {
        anomalies.push({
          nodeId: node.id, type: data[i] > avg ? 'spike' : 'drop',
          magnitude: Math.round(rel * 100),
          description: `${node.label} — unusual ${data[i] > avg ? 'spike' : 'drop'} in ${months[i]}`,
        });
      }
    }
  });
  return anomalies.sort((a, b) => b.magnitude - a.magnitude).slice(0, 5);
}

const viewCards = [
  { id: 'overview' as const, label: 'Overview', icon: Eye, desc: 'Full causal graph visualization' },
  { id: 'investigation' as const, label: 'Investigation', icon: GitBranch, desc: 'Deep-dive node analysis' },
  { id: 'compare' as const, label: 'Compare', icon: GitCompare, desc: 'Side-by-side scenario comparison' },
  { id: 'scenario' as const, label: 'Scenario', icon: FlaskConical, desc: 'What-if simulations' },
  { id: 'ranking' as const, label: 'Impact Ranking', icon: BarChart3, desc: 'Ranked factor impact scores' },
  { id: 'breakchain' as const, label: 'Break Chain', icon: Shield, desc: 'Intervention chain analysis' },
  { id: 'map' as const, label: 'Map', icon: Map, desc: 'Geographic overlay' },
  { id: 'briefing' as const, label: 'Briefing', icon: FileText, desc: 'AI policy briefing' },
  { id: 'anomaly' as const, label: 'Anomalies', icon: Radar, desc: 'Automated pattern detection' },
  { id: 'ingest' as const, label: 'Data', icon: Database, desc: 'Data source management' },
];

export default function DashboardHomeView() {
  const { setActiveView } = useDashboardStore();
  const [recentAnnotations, setRecentAnnotations] = useState<Annotation[]>([]);
  const topAnomalies = useMemo(() => detectTopAnomalies(), []);

  const criticalCount = nodes.filter(n => n.severity === 'critical').length;
  const highCount = nodes.filter(n => n.severity === 'high').length;
  const avgInfluence = edges.length ? (edges.reduce((s, e) => s + e.influenceStrength, 0) / edges.length * 100).toFixed(0) : '0';

  useEffect(() => {
    supabase
      .from('annotations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setRecentAnnotations(data as Annotation[]); });
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Hero */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          </div>
          <p className="text-xs text-muted-foreground">East Africa food security causal intelligence overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Factors Tracked', value: String(nodes.length), icon: Activity, color: 'text-primary' },
            { label: 'Critical Alerts', value: String(criticalCount), icon: AlertTriangle, color: 'text-destructive' },
            { label: 'High Risk', value: String(highCount), icon: TrendingUp, color: 'text-[hsl(var(--severity-high))]' },
            { label: 'Avg Influence', value: `${avgInfluence}%`, icon: Zap, color: 'text-primary' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <m.icon size={14} className={m.color} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</span>
              </div>
              <span className="text-2xl font-semibold text-foreground font-mono">{m.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Anomalies */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Radar size={12} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Top Anomalies</span>
              </div>
              <button onClick={() => setActiveView('anomaly')} className="text-[10px] text-primary hover:underline">View all →</button>
            </div>
            <div className="space-y-1.5">
              {topAnomalies.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted text-xs">
                  <span>{a.type === 'spike' ? '📈' : '📉'}</span>
                  <span className="text-secondary-foreground flex-1 truncate">{a.description}</span>
                  <span className="font-mono text-[10px] text-destructive">{a.magnitude}</span>
                </div>
              ))}
              {topAnomalies.length === 0 && <div className="text-[10px] text-muted-foreground text-center py-4">No anomalies detected</div>}
            </div>
          </div>

          {/* Recent Annotations */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <MessageSquarePlus size={12} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Recent Notes</span>
            </div>
            <div className="space-y-1.5">
              {recentAnnotations.map(a => (
                <div key={a.id} className="p-2 rounded bg-muted border-l-2" style={{ borderLeftColor: a.color }}>
                  <div className="text-[10px] font-mono text-muted-foreground">{a.author_name} · {new Date(a.created_at).toLocaleDateString()}</div>
                  <p className="text-[11px] text-secondary-foreground truncate">{a.content}</p>
                </div>
              ))}
              {recentAnnotations.length === 0 && <div className="text-[10px] text-muted-foreground text-center py-4">No notes yet</div>}
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Quick Access</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {viewCards.map((v, i) => (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setActiveView(v.id)}
                className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors text-left group"
              >
                <v.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                <div className="text-xs font-medium text-foreground">{v.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{v.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

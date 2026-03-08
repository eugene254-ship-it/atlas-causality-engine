import { useState, useMemo } from 'react';
import { nodes, edges } from '@/data/causalData';
import { domainIcons, severityColors } from '@/lib/domainUtils';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortKey = 'causalScore' | 'confidence' | 'downstream' | 'severity';
type SortDir = 'asc' | 'desc';

const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
const confidenceRank = { high: 3, medium: 2, low: 1 };

interface DriverRow {
  id: string;
  label: string;
  domain: string;
  icon: string;
  severity: string;
  severityColor: string;
  confidence: string;
  causalScore: number;
  downstream: number;
  currentValue: string;
}

export default function ImpactRankingTable() {
  const [sortKey, setSortKey] = useState<SortKey>('causalScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const rows: DriverRow[] = useMemo(() => {
    return nodes.map(node => {
      // Causal score = sum of outgoing influence strengths
      const outEdges = edges.filter(e => e.sourceId === node.id);
      const causalScore = outEdges.reduce((sum, e) => sum + e.influenceStrength, 0);
      const downstreamCount = outEdges.length;

      return {
        id: node.id,
        label: node.label,
        domain: node.domain,
        icon: domainIcons[node.domain],
        severity: node.severity,
        severityColor: severityColors[node.severity],
        confidence: node.confidence,
        causalScore: Math.round(causalScore * 100) / 100,
        downstream: downstreamCount,
        currentValue: node.currentValue || '—',
      };
    });
  }, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'causalScore': cmp = a.causalScore - b.causalScore; break;
        case 'confidence': cmp = confidenceRank[a.confidence as keyof typeof confidenceRank] - confidenceRank[b.confidence as keyof typeof confidenceRank]; break;
        case 'downstream': cmp = a.downstream - b.downstream; break;
        case 'severity': cmp = severityRank[a.severity as keyof typeof severityRank] - severityRank[b.severity as keyof typeof severityRank]; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={10} className="text-muted-foreground" />;
    return sortDir === 'desc' ? <ArrowDown size={10} className="text-primary" /> : <ArrowUp size={10} className="text-primary" />;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <h2 className="text-sm font-semibold text-foreground mb-1">Impact Ranking</h2>
        <p className="text-xs text-muted-foreground">All active drivers sorted by influence</p>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Factor</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Value</th>
              <th className="px-3 py-2.5 cursor-pointer select-none" onClick={() => toggleSort('severity')}>
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Severity <SortIcon col="severity" />
                </div>
              </th>
              <th className="px-3 py-2.5 cursor-pointer select-none" onClick={() => toggleSort('confidence')}>
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Conf. <SortIcon col="confidence" />
                </div>
              </th>
              <th className="px-3 py-2.5 cursor-pointer select-none" onClick={() => toggleSort('causalScore')}>
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Causal Score <SortIcon col="causalScore" />
                </div>
              </th>
              <th className="px-3 py-2.5 cursor-pointer select-none" onClick={() => toggleSort('downstream')}>
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Downstream <SortIcon col="downstream" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{row.icon}</span>
                    <span className="font-medium text-foreground">{row.label}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{row.currentValue}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: row.severityColor }} />
                    <span className="capitalize text-muted-foreground">{row.severity}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 capitalize text-muted-foreground">{row.confidence}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(row.causalScore * 50, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-foreground">{row.causalScore}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono text-center text-muted-foreground">{row.downstream}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

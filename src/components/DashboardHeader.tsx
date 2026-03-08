import { useDashboardStore } from '@/store/dashboardStore';
import { AlertTriangle, Activity, Zap, Eye, GitBranch, GitCompare, FlaskConical, BarChart3, Shield, Map, FileText, Database } from 'lucide-react';
import ExportPDFButton from '@/components/panels/ExportPDFButton';

export default function DashboardHeader() {
  const { activeView, setActiveView, showInterventions, toggleInterventions } = useDashboardStore();

  const views = [
    { id: 'overview' as const, label: 'Overview', icon: Eye },
    { id: 'investigation' as const, label: 'Investigation', icon: GitBranch },
    { id: 'compare' as const, label: 'Compare', icon: GitCompare },
    { id: 'scenario' as const, label: 'Scenario', icon: FlaskConical },
    { id: 'ranking' as const, label: 'Impact Ranking', icon: BarChart3 },
    { id: 'breakchain' as const, label: 'Break Chain', icon: Shield },
    { id: 'map' as const, label: 'Map', icon: Map },
    { id: 'briefing' as const, label: 'Briefing', icon: FileText },
    { id: 'ingest' as const, label: 'Data', icon: Database },
  ];

  return (
    <header className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <Activity size={14} className="text-primary" />
          </div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            Atlas <span className="text-muted-foreground font-normal">Causality</span>
          </h1>
        </div>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-1">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeView === v.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <v.icon size={12} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {(activeView === 'overview' || activeView === 'investigation') && (
          <button
            onClick={toggleInterventions}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              showInterventions
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Zap size={12} />
            Interventions
          </button>
        )}

        <ExportPDFButton />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/10">
            <AlertTriangle size={11} className="text-destructive" />
            <span className="text-[10px] font-mono text-destructive">3 Critical</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            Updated 2h ago
          </div>
        </div>
      </div>
    </header>
  );
}

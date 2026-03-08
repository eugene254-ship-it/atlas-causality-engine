import { useDashboardStore } from '@/store/dashboardStore';
import { domainColors, domainIcons } from '@/lib/domainUtils';
import { Domain } from '@/data/causalData';

const domains: Domain[] = ['climate', 'agriculture', 'trade', 'economics', 'infrastructure', 'health', 'social', 'governance', 'migration'];
const confidenceLevels = ['all', 'high', 'medium', 'low'] as const;

export default function FilterControls() {
  const { domainFilter, confidenceFilter, toggleDomainFilter, setConfidenceFilter } = useDashboardStore();

  return (
    <div className="px-4 py-3 border-b border-border">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
        Filters
      </h3>

      {/* Confidence */}
      <div className="mb-3">
        <div className="text-[10px] font-mono text-muted-foreground mb-1.5 uppercase">Confidence</div>
        <div className="flex flex-wrap gap-1">
          {confidenceLevels.map(level => (
            <button
              key={level}
              onClick={() => setConfidenceFilter(level)}
              className={`text-[10px] px-2 py-1 rounded font-mono capitalize transition-colors ${
                confidenceFilter === level
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-muted text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Domains */}
      <div>
        <div className="text-[10px] font-mono text-muted-foreground mb-1.5 uppercase">Domains</div>
        <div className="flex flex-wrap gap-1">
          {domains.map(domain => {
            const active = domainFilter.length === 0 || domainFilter.includes(domain);
            return (
              <button
                key={domain}
                onClick={() => toggleDomainFilter(domain)}
                className={`text-[10px] px-2 py-1 rounded font-mono capitalize transition-all flex items-center gap-1 border ${
                  active
                    ? 'border-opacity-30'
                    : 'opacity-40 border-transparent'
                }`}
                style={{
                  backgroundColor: active ? `${domainColors[domain]}15` : undefined,
                  color: active ? domainColors[domain] : undefined,
                  borderColor: active ? `${domainColors[domain]}44` : 'transparent',
                }}
              >
                <span className="text-xs">{domainIcons[domain]}</span>
                {domain}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

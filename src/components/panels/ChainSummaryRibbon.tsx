import { chainSummary } from '@/data/causalData';

export default function ChainSummaryRibbon() {
  return (
    <div className="px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-flow-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Chain Summary
          </span>
          <p className="text-xs text-secondary-foreground leading-relaxed mt-0.5">
            {chainSummary}
          </p>
        </div>
      </div>
    </div>
  );
}

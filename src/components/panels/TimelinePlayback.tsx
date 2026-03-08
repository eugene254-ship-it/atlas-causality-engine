import { useDashboardStore } from '@/store/dashboardStore';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TimelinePlayback() {
  const { timelinePosition, setTimelinePosition } = useDashboardStore();

  return (
    <div className="px-6 py-3 border-t border-border bg-card">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider whitespace-nowrap">
          Timeline
        </span>
        
        <div className="flex-1 relative">
          {/* Track */}
          <div className="h-1 rounded-full bg-muted relative">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${(timelinePosition / 11) * 100}%` }}
            />
          </div>
          
          {/* Month labels */}
          <div className="flex justify-between mt-1.5">
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => setTimelinePosition(i)}
                className={`text-[9px] font-mono transition-colors cursor-pointer ${
                  i <= timelinePosition ? 'text-primary' : 'text-muted-foreground'
                } ${i === timelinePosition ? 'font-bold' : ''}`}
              >
                {m}
              </button>
            ))}
          </div>
          
          {/* Slider input */}
          <input
            type="range"
            min={0}
            max={11}
            value={timelinePosition}
            onChange={(e) => setTimelinePosition(Number(e.target.value))}
            className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer -mt-1.5"
          />
        </div>

        <span className="text-xs font-mono text-foreground whitespace-nowrap">
          {months[timelinePosition]} 2025
        </span>
      </div>
    </div>
  );
}

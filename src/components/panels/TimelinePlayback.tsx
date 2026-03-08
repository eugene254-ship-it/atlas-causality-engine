import { useDashboardStore } from '@/store/dashboardStore';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TimelinePlayback() {
  const { timelinePosition, setTimelinePosition } = useDashboardStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500); // ms per step
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    
    intervalRef.current = setInterval(() => {
      setTimelinePosition((prev: number) => {
        if (prev >= 11) {
          stopPlayback();
          return 11;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, setTimelinePosition, stopPlayback]);

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (timelinePosition >= 11) setTimelinePosition(0);
      startPlayback();
    }
  };

  const cycleSpeed = () => {
    setPlaybackSpeed(prev => {
      if (prev === 1500) return 800;
      if (prev === 800) return 400;
      return 1500;
    });
  };

  const speedLabel = playbackSpeed === 1500 ? '1×' : playbackSpeed === 800 ? '2×' : '3×';

  return (
    <div className="px-6 py-3 border-t border-border bg-card">
      <div className="flex items-center gap-3">
        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { stopPlayback(); setTimelinePosition(0); }}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Reset to start"
          >
            <SkipBack size={11} />
          </button>
          <button
            onClick={togglePlay}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              isPlaying 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
            title={isPlaying ? 'Pause' : 'Play timeline'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>
          <button
            onClick={() => { stopPlayback(); setTimelinePosition(11); }}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Skip to end"
          >
            <SkipForward size={11} />
          </button>
          <button
            onClick={cycleSpeed}
            className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Playback speed"
          >
            {speedLabel}
          </button>
        </div>

        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider whitespace-nowrap">
          Timeline
        </span>
        
        <div className="flex-1 relative">
          {/* Track */}
          <div className="h-1 rounded-full bg-muted relative">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(timelinePosition / 11) * 100}%` }}
            />
          </div>
          
          {/* Month labels */}
          <div className="flex justify-between mt-1.5">
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => { stopPlayback(); setTimelinePosition(i); }}
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
            onChange={(e) => { stopPlayback(); setTimelinePosition(Number(e.target.value)); }}
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

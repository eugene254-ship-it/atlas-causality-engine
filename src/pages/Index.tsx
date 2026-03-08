import { useDashboardStore } from '@/store/dashboardStore';
import DashboardHeader from '@/components/DashboardHeader';
import CausalCanvas from '@/components/graph/CausalCanvas';
import RootDriversPanel from '@/components/panels/RootDriversPanel';
import DownstreamPanel from '@/components/panels/DownstreamPanel';
import NodeInspector from '@/components/panels/NodeInspector';
import EdgeInspector from '@/components/panels/EdgeInspector';
import InterventionPanel from '@/components/panels/InterventionPanel';
import TimelinePlayback from '@/components/panels/TimelinePlayback';
import ChainSummaryRibbon from '@/components/panels/ChainSummaryRibbon';

const Index = () => {
  const { selectedNodeId, selectedEdgeId, showInterventions } = useDashboardStore();
  const showRightPanel = !!selectedNodeId || !!selectedEdgeId || showInterventions;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <DashboardHeader />
      <ChainSummaryRibbon />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Root Drivers */}
        <div className="w-72 border-r border-border flex-shrink-0 overflow-hidden">
          <RootDriversPanel />
        </div>

        {/* Center: Graph + Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <CausalCanvas />
          </div>
          <TimelinePlayback />
        </div>

        {/* Right panel: Inspector / Interventions */}
        {showRightPanel && (
          <div className="w-80 flex-shrink-0 overflow-hidden flex flex-col">
            {selectedNodeId && <NodeInspector />}
            {selectedEdgeId && !selectedNodeId && <EdgeInspector />}
            {showInterventions && !selectedNodeId && !selectedEdgeId && (
              <InterventionPanel />
            )}
          </div>
        )}

        {/* Downstream panel when node selected */}
        {selectedNodeId && (
          <div className="w-64 border-l border-border flex-shrink-0 overflow-hidden">
            <DownstreamPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

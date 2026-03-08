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
import FilterControls from '@/components/panels/FilterControls';
import ExplainThisButton from '@/components/panels/ExplainThisButton';
import ShowAlternativesButton from '@/components/panels/ShowAlternativesButton';
import CompareMode from '@/components/views/CompareMode';
import ScenarioMode from '@/components/views/ScenarioMode';
import ImpactRankingTable from '@/components/panels/ImpactRankingTable';
import BreakTheChainView from '@/components/views/BreakTheChainView';
import MapView from '@/components/views/MapView';
import PolicyBriefingView from '@/components/views/PolicyBriefingView';
import DataIngestionView from '@/components/views/DataIngestionView';

const Index = () => {
  const { selectedNodeId, selectedEdgeId, showInterventions, activeView } = useDashboardStore();
  const showRightPanel = !!selectedNodeId || !!selectedEdgeId || showInterventions;
  const isGraphView = activeView === 'overview' || activeView === 'investigation';

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <DashboardHeader />
      
      {isGraphView && <ChainSummaryRibbon />}
      
      <div className="flex-1 flex overflow-hidden">
        {isGraphView && (
          <>
            {/* Left panel */}
            <div className="w-72 border-r border-border flex-shrink-0 overflow-hidden flex flex-col">
              <FilterControls />
              <div className="flex-1 overflow-hidden">
                <RootDriversPanel />
              </div>
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative">
                <CausalCanvas />
              </div>
              <TimelinePlayback />
            </div>

            {/* Right panel */}
            {showRightPanel && (
              <div className="w-80 flex-shrink-0 overflow-hidden flex flex-col">
                {selectedNodeId && (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <NodeInspector />
                    </div>
                    <ExplainThisButton />
                  </>
                )}
                {selectedEdgeId && !selectedNodeId && (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <EdgeInspector />
                    </div>
                    <ExplainThisButton />
                    <ShowAlternativesButton />
                  </>
                )}
                {showInterventions && !selectedNodeId && !selectedEdgeId && (
                  <InterventionPanel />
                )}
              </div>
            )}

            {/* Downstream */}
            {selectedNodeId && (
              <div className="w-64 border-l border-border flex-shrink-0 overflow-hidden">
                <DownstreamPanel />
              </div>
            )}
          </>
        )}

        {activeView === 'compare' && <CompareMode />}
        {activeView === 'scenario' && <ScenarioMode />}
        {activeView === 'ranking' && <ImpactRankingTable />}
        {activeView === 'breakchain' && <BreakTheChainView />}
        {activeView === 'map' && <MapView />}
      </div>
    </div>
  );
};

export default Index;

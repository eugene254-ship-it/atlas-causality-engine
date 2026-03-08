import { create } from 'zustand';

interface DashboardState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hoveredNodeId: string | null;
  timelinePosition: number; // 0-11 for months
  activeView: 'overview' | 'investigation' | 'compare' | 'scenario';
  showInterventions: boolean;
  confidenceFilter: 'all' | 'high' | 'medium' | 'low';
  domainFilter: string[];
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setTimelinePosition: (pos: number) => void;
  setActiveView: (view: 'overview' | 'investigation' | 'compare' | 'scenario') => void;
  toggleInterventions: () => void;
  setConfidenceFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  toggleDomainFilter: (domain: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  hoveredNodeId: null,
  timelinePosition: 11,
  activeView: 'overview',
  showInterventions: false,
  confidenceFilter: 'all',
  domainFilter: [],
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setTimelinePosition: (pos) => set({ timelinePosition: pos }),
  setActiveView: (view) => set({ activeView: view }),
  toggleInterventions: () => set((s) => ({ showInterventions: !s.showInterventions })),
  setConfidenceFilter: (filter) => set({ confidenceFilter: filter }),
  toggleDomainFilter: (domain) => set((s) => ({
    domainFilter: s.domainFilter.includes(domain)
      ? s.domainFilter.filter(d => d !== domain)
      : [...s.domainFilter, domain],
  })),
}));

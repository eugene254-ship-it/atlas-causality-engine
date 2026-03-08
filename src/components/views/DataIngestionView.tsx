import { useState } from 'react';
import { nodes } from '@/data/causalData';
import { domainIcons, domainColors, severityColors } from '@/lib/domainUtils';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Clock, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataSource {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  status: 'connected' | 'degraded' | 'offline';
  lastSync: string;
  refreshInterval: string;
  mappedNodes: string[];
  dataPoints: number;
  description: string;
}

const dataSources: DataSource[] = [
  {
    id: 'wfp-vam',
    name: 'Food Price Monitor',
    provider: 'WFP VAM',
    endpoint: 'api.vam.wfp.org/v1/prices',
    status: 'connected',
    lastSync: '12 min ago',
    refreshInterval: '30 min',
    mappedNodes: ['grain-prices', 'food-stress'],
    dataPoints: 2847,
    description: 'Real-time food commodity prices across East African markets.',
  },
  {
    id: 'acled',
    name: 'Conflict Event Tracker',
    provider: 'ACLED',
    endpoint: 'api.acleddata.com/v3/events',
    status: 'connected',
    lastSync: '2 hours ago',
    refreshInterval: '6 hours',
    mappedNodes: ['protest-risk', 'urban-dissatisfaction'],
    dataPoints: 1203,
    description: 'Political violence and protest event data for Kenya and Ethiopia.',
  },
  {
    id: 'chirps',
    name: 'Rainfall Monitoring',
    provider: 'CHIRPS / FEWS NET',
    endpoint: 'data.chc.ucsb.edu/products/CHIRPS-2.0',
    status: 'connected',
    lastSync: '1 day ago',
    refreshInterval: '24 hours',
    mappedNodes: ['rainfall-deficit', 'crop-output'],
    dataPoints: 5621,
    description: 'Satellite-derived rainfall estimates for sub-Saharan Africa.',
  },
  {
    id: 'cbk',
    name: 'Exchange Rate Feed',
    provider: 'Central Bank of Kenya',
    endpoint: 'api.centralbank.go.ke/forex',
    status: 'degraded',
    lastSync: '4 hours ago',
    refreshInterval: '1 hour',
    mappedNodes: ['currency-weakness'],
    dataPoints: 365,
    description: 'Daily KES/USD exchange rates and monetary indicators.',
  },
  {
    id: 'unicef-nutrition',
    name: 'Nutrition Surveillance',
    provider: 'UNICEF',
    endpoint: 'data.unicef.org/api/nutrition',
    status: 'offline',
    lastSync: '3 days ago',
    refreshInterval: '12 hours',
    mappedNodes: ['malnutrition'],
    dataPoints: 892,
    description: 'Child malnutrition monitoring data from health facility reports.',
  },
  {
    id: 'transport-index',
    name: 'Transport Cost Index',
    provider: 'Kenya NHA',
    endpoint: 'api.kenha.co.ke/logistics',
    status: 'connected',
    lastSync: '45 min ago',
    refreshInterval: '2 hours',
    mappedNodes: ['transport-costs'],
    dataPoints: 476,
    description: 'Freight and fuel cost indices along major transport corridors.',
  },
];

const statusConfig = {
  connected: { icon: CheckCircle2, color: 'hsl(var(--severity-low))', label: 'Connected' },
  degraded: { icon: AlertTriangle, color: 'hsl(var(--severity-medium))', label: 'Degraded' },
  offline: { icon: WifiOff, color: 'hsl(var(--severity-critical))', label: 'Offline' },
};

export default function DataIngestionView() {
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const handleRefresh = (id: string) => {
    setRefreshingId(id);
    setTimeout(() => setRefreshingId(null), 2000);
  };

  const connectedCount = dataSources.filter(s => s.status === 'connected').length;
  const totalDataPoints = dataSources.reduce((s, d) => s + d.dataPoints, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2 mb-1">
          <Database size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Data Ingestion</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time data feeds updating causal chain node values automatically
        </p>
      </div>

      {/* Status bar */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Wifi size={12} className="text-primary" />
          <span className="text-[10px] font-mono text-foreground">{connectedCount}/{dataSources.length} sources active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database size={12} className="text-muted-foreground" />
          <span className="text-[10px] font-mono text-muted-foreground">{totalDataPoints.toLocaleString()} data points</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-muted-foreground" />
          <span className="text-[10px] font-mono text-muted-foreground">Auto-refresh enabled</span>
        </div>
      </div>

      {/* Sources list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {dataSources.map((source, index) => {
          const statusInfo = statusConfig[source.status];
          const StatusIcon = statusInfo.icon;
          const isSelected = selectedSource === source.id;

          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`rounded-lg border transition-all cursor-pointer ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                }`}
                onClick={() => setSelectedSource(isSelected ? null : source.id)}
              >
                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusIcon size={14} style={{ color: statusInfo.color }} />
                        <span className="text-sm font-semibold text-foreground">{source.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground ml-6">{source.provider}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRefresh(source.id); }}
                      disabled={source.status === 'offline' || refreshingId === source.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <RefreshCw size={10} className={refreshingId === source.id ? 'animate-spin' : ''} />
                      {refreshingId === source.id ? 'Syncing…' : 'Sync Now'}
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 rounded bg-muted text-center">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">Status</div>
                      <div className="text-xs font-medium capitalize" style={{ color: statusInfo.color }}>{source.status}</div>
                    </div>
                    <div className="p-2 rounded bg-muted text-center">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">Last Sync</div>
                      <div className="text-xs font-medium text-foreground">{source.lastSync}</div>
                    </div>
                    <div className="p-2 rounded bg-muted text-center">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">Interval</div>
                      <div className="text-xs font-medium text-foreground">{source.refreshInterval}</div>
                    </div>
                  </div>

                  {/* Mapped nodes */}
                  <div className="flex flex-wrap gap-1.5">
                    {source.mappedNodes.map(nodeId => {
                      const node = nodes.find(n => n.id === nodeId);
                      if (!node) return null;
                      return (
                        <span
                          key={nodeId}
                          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${domainColors[node.domain]}15`,
                            color: domainColors[node.domain],
                          }}
                        >
                          {domainIcons[node.domain]} {node.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 pt-3 border-t border-border space-y-2"
                    >
                      <p className="text-xs text-secondary-foreground">{source.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">Endpoint:</span>
                        <code className="text-[10px] font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{source.endpoint}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">Data points:</span>
                        <span className="text-[10px] font-mono text-foreground">{source.dataPoints.toLocaleString()}</span>
                      </div>

                      {/* Node mapping detail */}
                      <div className="mt-2">
                        <div className="text-[9px] font-mono uppercase text-muted-foreground mb-1.5">Node Updates</div>
                        {source.mappedNodes.map(nodeId => {
                          const node = nodes.find(n => n.id === nodeId);
                          if (!node) return null;
                          return (
                            <div key={nodeId} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{domainIcons[node.domain]}</span>
                                <span className="text-xs text-foreground">{node.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono" style={{ color: domainColors[node.domain] }}>
                                  {node.currentValue}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: severityColors[node.severity] }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="px-6 py-3 border-t border-border bg-card/50">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
          <div className="text-[10px] font-mono uppercase text-primary mb-1">Integration Note</div>
          <p className="text-[10px] text-secondary-foreground leading-relaxed">
            Data sources shown are configured feeds. Connect API keys in your backend settings to enable 
            live data ingestion. Node values will auto-update based on incoming data and configured refresh intervals.
          </p>
        </div>
      </div>
    </div>
  );
}

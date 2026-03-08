import { Domain, Severity, Confidence } from '@/data/causalData';

export const domainColors: Record<Domain, string> = {
  climate: 'hsl(174, 60%, 50%)',
  agriculture: 'hsl(142, 50%, 45%)',
  economics: 'hsl(38, 80%, 55%)',
  infrastructure: 'hsl(210, 60%, 55%)',
  governance: 'hsl(270, 45%, 55%)',
  social: 'hsl(0, 65%, 55%)',
  health: 'hsl(186, 60%, 50%)',
  trade: 'hsl(28, 70%, 50%)',
  migration: 'hsl(200, 50%, 50%)',
};

export const domainIcons: Record<Domain, string> = {
  climate: '🌧️',
  agriculture: '🌾',
  economics: '📊',
  infrastructure: '🛣️',
  governance: '🏛️',
  social: '👥',
  health: '🏥',
  trade: '📦',
  migration: '🚶',
};

export const severityColors: Record<Severity, string> = {
  critical: 'hsl(0, 72%, 55%)',
  high: 'hsl(25, 80%, 55%)',
  medium: 'hsl(38, 80%, 55%)',
  low: 'hsl(142, 50%, 45%)',
};

export const confidenceLabels: Record<Confidence, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

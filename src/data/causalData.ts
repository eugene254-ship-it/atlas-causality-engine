export type Domain = 'climate' | 'agriculture' | 'economics' | 'infrastructure' | 'governance' | 'social' | 'health' | 'trade' | 'migration';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Confidence = 'high' | 'medium' | 'low';

export interface CausalNode {
  id: string;
  label: string;
  domain: Domain;
  description: string;
  currentValue?: string;
  changeDelta?: string;
  severity: Severity;
  confidence: Confidence;
  evidenceCount: number;
  interventionEligible: boolean;
  trendData: number[];
  upstreamCount: number;
  downstreamCount: number;
}

export interface CausalEdge {
  id: string;
  sourceId: string;
  targetId: string;
  polarity: 'positive' | 'negative';
  influenceStrength: number; // 0-1
  confidence: Confidence;
  lagMin: number; // weeks
  lagMax: number; // weeks
  methodType: string;
  directness: 'direct' | 'indirect';
  evidenceSources: string[];
  mechanism: string;
  confounders: string[];
  alternateHypotheses: string[];
}

export interface Intervention {
  id: string;
  label: string;
  targetNodeIds: string[];
  estimatedImpact: number; // 0-1
  timeToEffect: string;
  confidence: Confidence;
  costBand: 'low' | 'medium' | 'high';
  description: string;
  risks: string[];
  affectedDownstream: string[];
}

export const nodes: CausalNode[] = [
  {
    id: 'rainfall-deficit',
    label: 'Rainfall Deficit',
    domain: 'climate',
    description: 'Below-average rainfall in eastern Ethiopia for two consecutive seasons, driven by Indian Ocean Dipole anomaly.',
    currentValue: '-38% below avg',
    changeDelta: '-12% vs last month',
    severity: 'high',
    confidence: 'high',
    evidenceCount: 14,
    interventionEligible: false,
    trendData: [80, 72, 65, 55, 48, 42, 38, 35, 32, 30, 28, 25],
    upstreamCount: 0,
    downstreamCount: 3,
  },
  {
    id: 'crop-output',
    label: 'Crop Output Decline',
    domain: 'agriculture',
    description: 'Maize and sorghum yields have fallen significantly in Oromia and SNNPR regions.',
    currentValue: '-27% YoY',
    changeDelta: '-8% vs last month',
    severity: 'high',
    confidence: 'high',
    evidenceCount: 11,
    interventionEligible: true,
    trendData: [95, 90, 82, 75, 70, 65, 60, 58, 55, 52, 50, 48],
    upstreamCount: 1,
    downstreamCount: 2,
  },
  {
    id: 'grain-supply',
    label: 'Regional Grain Shortage',
    domain: 'trade',
    description: 'Cross-border grain flows from Ethiopia to Kenya have decreased, tightening regional supply.',
    currentValue: '-31% volume',
    changeDelta: '-5% vs last month',
    severity: 'high',
    confidence: 'medium',
    evidenceCount: 8,
    interventionEligible: true,
    trendData: [100, 95, 88, 80, 74, 70, 65, 62, 58, 55, 52, 50],
    upstreamCount: 2,
    downstreamCount: 2,
  },
  {
    id: 'grain-prices',
    label: 'Grain Price Inflation',
    domain: 'economics',
    description: 'Wholesale maize prices in Nairobi have surged due to supply constraints and transport cost increases.',
    currentValue: '+34% in 8 weeks',
    changeDelta: '+6% vs last week',
    severity: 'critical',
    confidence: 'high',
    evidenceCount: 16,
    interventionEligible: true,
    trendData: [30, 32, 35, 38, 42, 48, 55, 62, 70, 78, 85, 92],
    upstreamCount: 3,
    downstreamCount: 3,
  },
  {
    id: 'transport-costs',
    label: 'Transport Cost Surge',
    domain: 'infrastructure',
    description: 'Fuel price increases and road disruptions have raised freight costs on Mombasa-Nairobi-Kampala corridor.',
    currentValue: '+22% in 6 weeks',
    changeDelta: '+3% vs last week',
    severity: 'medium',
    confidence: 'medium',
    evidenceCount: 6,
    interventionEligible: true,
    trendData: [40, 42, 44, 48, 52, 55, 58, 60, 62, 64, 66, 68],
    upstreamCount: 0,
    downstreamCount: 2,
  },
  {
    id: 'food-stress',
    label: 'Household Food Stress',
    domain: 'health',
    description: 'Rising food prices combined with stagnant incomes are pushing urban households into food insecurity.',
    currentValue: '2.4M affected',
    changeDelta: '+400K vs last month',
    severity: 'critical',
    confidence: 'high',
    evidenceCount: 12,
    interventionEligible: true,
    trendData: [10, 12, 15, 18, 22, 28, 35, 42, 50, 58, 65, 72],
    upstreamCount: 3,
    downstreamCount: 3,
  },
  {
    id: 'currency-weakness',
    label: 'Currency Depreciation',
    domain: 'economics',
    description: 'KES has weakened against USD, increasing import costs for food and fuel.',
    currentValue: '-8% vs USD',
    changeDelta: '-1.2% vs last month',
    severity: 'medium',
    confidence: 'high',
    evidenceCount: 9,
    interventionEligible: false,
    trendData: [50, 52, 53, 55, 56, 58, 60, 61, 63, 65, 67, 68],
    upstreamCount: 0,
    downstreamCount: 1,
  },
  {
    id: 'urban-dissatisfaction',
    label: 'Urban Dissatisfaction',
    domain: 'social',
    description: 'Grievance sentiment in Nairobi informal settlements is rising, tracked via social media and community reports.',
    currentValue: 'Grievance index: 72/100',
    changeDelta: '+15 pts in 6 weeks',
    severity: 'high',
    confidence: 'medium',
    evidenceCount: 7,
    interventionEligible: true,
    trendData: [30, 32, 35, 40, 45, 50, 55, 60, 65, 68, 70, 72],
    upstreamCount: 2,
    downstreamCount: 2,
  },
  {
    id: 'protest-risk',
    label: 'Protest Probability',
    domain: 'governance',
    description: 'Estimated probability of significant urban protests in Nairobi within the next 4 weeks.',
    currentValue: '68% probability',
    changeDelta: '+18% vs last month',
    severity: 'critical',
    confidence: 'medium',
    evidenceCount: 5,
    interventionEligible: true,
    trendData: [15, 18, 22, 28, 32, 38, 42, 48, 55, 60, 65, 68],
    upstreamCount: 2,
    downstreamCount: 1,
  },
  {
    id: 'malnutrition',
    label: 'Malnutrition Risk',
    domain: 'health',
    description: 'Acute malnutrition rates among children under 5 are increasing in affected urban areas.',
    currentValue: '+45% cases',
    changeDelta: '+12% vs last month',
    severity: 'critical',
    confidence: 'high',
    evidenceCount: 10,
    interventionEligible: true,
    trendData: [10, 12, 14, 18, 22, 28, 35, 40, 48, 55, 62, 68],
    upstreamCount: 1,
    downstreamCount: 1,
  },
  {
    id: 'subsidy-pressure',
    label: 'Subsidy Pressure',
    domain: 'governance',
    description: 'Political pressure on government to introduce emergency food subsidies is mounting.',
    currentValue: 'High',
    changeDelta: 'Escalating',
    severity: 'medium',
    confidence: 'medium',
    evidenceCount: 4,
    interventionEligible: true,
    trendData: [20, 22, 25, 30, 35, 40, 48, 55, 60, 65, 70, 75],
    upstreamCount: 2,
    downstreamCount: 0,
  },
];

export const edges: CausalEdge[] = [
  {
    id: 'e-rainfall-crop',
    sourceId: 'rainfall-deficit',
    targetId: 'crop-output',
    polarity: 'positive',
    influenceStrength: 0.85,
    confidence: 'high',
    lagMin: 4,
    lagMax: 12,
    methodType: 'Bayesian structural time series',
    directness: 'direct',
    evidenceSources: ['Satellite vegetation index (NDVI)', 'FAO crop assessment reports', 'Ethiopian CSA data'],
    mechanism: 'Reduced soil moisture and water availability directly decreases crop germination, growth, and yield.',
    confounders: ['Seed quality variation', 'Fertilizer availability', 'Pest outbreaks'],
    alternateHypotheses: ['Crop decline may be partially driven by input supply disruptions unrelated to rainfall'],
  },
  {
    id: 'e-crop-grain',
    sourceId: 'crop-output',
    targetId: 'grain-supply',
    polarity: 'positive',
    influenceStrength: 0.72,
    confidence: 'high',
    lagMin: 2,
    lagMax: 6,
    methodType: 'Trade dependency graph analysis',
    directness: 'direct',
    evidenceSources: ['COMTRADE data', 'Kenya Revenue Authority import records', 'WFP market monitoring'],
    mechanism: 'Ethiopia is a major regional grain supplier. Output decline reduces exportable surplus.',
    confounders: ['Government export restrictions', 'Alternative supplier substitution'],
    alternateHypotheses: ['Supply constraint may be driven more by export bans than production decline'],
  },
  {
    id: 'e-grain-prices',
    sourceId: 'grain-supply',
    targetId: 'grain-prices',
    polarity: 'positive',
    influenceStrength: 0.78,
    confidence: 'high',
    lagMin: 1,
    lagMax: 4,
    methodType: 'Market price elasticity model',
    directness: 'direct',
    evidenceSources: ['Nairobi wholesale market data', 'KNBS price indices', 'WFP VAM'],
    mechanism: 'Reduced grain availability creates supply-demand imbalance, pushing wholesale prices upward.',
    confounders: ['Speculative hoarding', 'Import price movements', 'Currency effects'],
    alternateHypotheses: ['Price increase may be primarily driven by fuel costs rather than supply shortage'],
  },
  {
    id: 'e-transport-prices',
    sourceId: 'transport-costs',
    targetId: 'grain-prices',
    polarity: 'positive',
    influenceStrength: 0.45,
    confidence: 'medium',
    lagMin: 1,
    lagMax: 2,
    methodType: 'Cost pass-through analysis',
    directness: 'direct',
    evidenceSources: ['Kenya National Highways Authority', 'Fuel price tracking', 'Logistics surveys'],
    mechanism: 'Higher freight costs are passed through to wholesale and retail grain prices.',
    confounders: ['Competitive logistics market', 'Fuel subsidies'],
    alternateHypotheses: ['Transport cost impact may be overstated relative to supply-side factors'],
  },
  {
    id: 'e-currency-prices',
    sourceId: 'currency-weakness',
    targetId: 'grain-prices',
    polarity: 'positive',
    influenceStrength: 0.35,
    confidence: 'high',
    lagMin: 1,
    lagMax: 3,
    methodType: 'Exchange rate pass-through model',
    directness: 'indirect',
    evidenceSources: ['Central Bank of Kenya', 'Import price indices'],
    mechanism: 'Weaker currency increases the local cost of imported grains and inputs.',
    confounders: ['Import substitution', 'Hedging by large importers'],
    alternateHypotheses: ['Currency effect may be absorbed by importers rather than passed to consumers'],
  },
  {
    id: 'e-prices-food',
    sourceId: 'grain-prices',
    targetId: 'food-stress',
    polarity: 'positive',
    influenceStrength: 0.82,
    confidence: 'high',
    lagMin: 1,
    lagMax: 3,
    methodType: 'Household expenditure elasticity model',
    directness: 'direct',
    evidenceSources: ['KNBS household surveys', 'WFP food security monitoring', 'Community assessments'],
    mechanism: 'Food constitutes 40-60% of household spending in informal settlements. Price increases directly reduce food access.',
    confounders: ['Income changes', 'Dietary substitution', 'Informal support networks'],
    alternateHypotheses: ['Food stress may be driven more by income shocks than price increases'],
  },
  {
    id: 'e-food-dissatisfaction',
    sourceId: 'food-stress',
    targetId: 'urban-dissatisfaction',
    polarity: 'positive',
    influenceStrength: 0.68,
    confidence: 'medium',
    lagMin: 2,
    lagMax: 6,
    methodType: 'Grievance sentiment analysis + historical pattern matching',
    directness: 'direct',
    evidenceSources: ['Social media monitoring', 'Community leader interviews', 'NGO field reports'],
    mechanism: 'Food insecurity is a primary driver of urban grievance, especially when perceived as government failure.',
    confounders: ['Political mobilization', 'Media amplification', 'Pre-existing grievances'],
    alternateHypotheses: ['Dissatisfaction may be driven more by governance failures than food stress per se'],
  },
  {
    id: 'e-dissatisfaction-protest',
    sourceId: 'urban-dissatisfaction',
    targetId: 'protest-risk',
    polarity: 'positive',
    influenceStrength: 0.72,
    confidence: 'medium',
    lagMin: 1,
    lagMax: 4,
    methodType: 'ACLED-informed protest prediction model',
    directness: 'direct',
    evidenceSources: ['ACLED event data', 'Sentinel social media analysis', 'Police intelligence reports'],
    mechanism: 'Sustained high grievance levels reduce the threshold for collective action, especially with organizational triggers.',
    confounders: ['Security force posture', 'Political calendar', 'Organizational capacity'],
    alternateHypotheses: ['Protests may be triggered more by political events than food-related grievance'],
  },
  {
    id: 'e-food-malnutrition',
    sourceId: 'food-stress',
    targetId: 'malnutrition',
    polarity: 'positive',
    influenceStrength: 0.88,
    confidence: 'high',
    lagMin: 3,
    lagMax: 8,
    methodType: 'Nutritional surveillance + epidemiological model',
    directness: 'direct',
    evidenceSources: ['UNICEF nutrition surveys', 'Ministry of Health data', 'Hospital admission records'],
    mechanism: 'Prolonged food insecurity directly degrades dietary quality and quantity, especially for children under 5.',
    confounders: ['Water/sanitation conditions', 'Disease outbreaks', 'Supplementary feeding programs'],
    alternateHypotheses: ['Malnutrition increase may be compounded by concurrent disease outbreaks'],
  },
  {
    id: 'e-food-subsidy',
    sourceId: 'food-stress',
    targetId: 'subsidy-pressure',
    polarity: 'positive',
    influenceStrength: 0.6,
    confidence: 'medium',
    lagMin: 2,
    lagMax: 6,
    methodType: 'Political economy analysis',
    directness: 'direct',
    evidenceSources: ['Parliamentary records', 'Media analysis', 'Policy tracking'],
    mechanism: 'Visible food stress creates political imperative for government intervention via subsidies.',
    confounders: ['Fiscal constraints', 'Electoral calendar', 'Donor pressure'],
    alternateHypotheses: ['Subsidy pressure may be driven more by political competition than actual food stress levels'],
  },
  {
    id: 'e-protest-subsidy',
    sourceId: 'protest-risk',
    targetId: 'subsidy-pressure',
    polarity: 'positive',
    influenceStrength: 0.55,
    confidence: 'medium',
    lagMin: 1,
    lagMax: 3,
    methodType: 'Political response analysis',
    directness: 'direct',
    evidenceSources: ['Government announcements', 'Budget allocation tracking'],
    mechanism: 'Protest risk accelerates government willingness to deploy subsidies as a stabilization measure.',
    confounders: ['Budget availability', 'Alternative policy options'],
    alternateHypotheses: ['Government may respond to protests with security measures rather than subsidies'],
  },
];

export const interventions: Intervention[] = [
  {
    id: 'int-grain-subsidy',
    label: 'Emergency Grain Subsidy',
    targetNodeIds: ['grain-prices', 'food-stress'],
    estimatedImpact: 0.65,
    timeToEffect: '2-4 weeks',
    confidence: 'high',
    costBand: 'high',
    description: 'Government-funded price ceiling on staple grains through direct market intervention.',
    risks: ['Fiscal strain', 'Market distortion', 'Dependency creation', 'Targeting leakage'],
    affectedDownstream: ['food-stress', 'urban-dissatisfaction', 'protest-risk', 'malnutrition'],
  },
  {
    id: 'int-transport-corridor',
    label: 'Transport Corridor Reopening',
    targetNodeIds: ['transport-costs', 'grain-prices'],
    estimatedImpact: 0.4,
    timeToEffect: '1-3 weeks',
    confidence: 'medium',
    costBand: 'medium',
    description: 'Expedited road repairs and fuel subsidies for grain transporters on key corridors.',
    risks: ['Fuel subsidy costs', 'Partial road access', 'Driver shortage'],
    affectedDownstream: ['grain-prices', 'food-stress', 'urban-dissatisfaction'],
  },
  {
    id: 'int-reserve-release',
    label: 'Strategic Reserve Release',
    targetNodeIds: ['grain-supply', 'grain-prices'],
    estimatedImpact: 0.55,
    timeToEffect: '1-2 weeks',
    confidence: 'high',
    costBand: 'low',
    description: 'Release of national grain reserves to stabilize wholesale markets.',
    risks: ['Reserve depletion', 'Distribution bottlenecks', 'Short-term only'],
    affectedDownstream: ['grain-prices', 'food-stress'],
  },
  {
    id: 'int-cash-transfer',
    label: 'Emergency Cash Transfers',
    targetNodeIds: ['food-stress'],
    estimatedImpact: 0.5,
    timeToEffect: '3-6 weeks',
    confidence: 'medium',
    costBand: 'high',
    description: 'Direct cash transfers to vulnerable urban households via mobile money.',
    risks: ['Targeting accuracy', 'Inflation amplification', 'Registration delays'],
    affectedDownstream: ['food-stress', 'malnutrition', 'urban-dissatisfaction'],
  },
  {
    id: 'int-irrigation',
    label: 'Emergency Irrigation Support',
    targetNodeIds: ['crop-output'],
    estimatedImpact: 0.3,
    timeToEffect: '8-16 weeks',
    confidence: 'low',
    costBand: 'high',
    description: 'Rapid deployment of irrigation infrastructure in affected agricultural zones.',
    risks: ['Long implementation time', 'Water source availability', 'Technical capacity'],
    affectedDownstream: ['crop-output', 'grain-supply', 'grain-prices'],
  },
];

export const chainSummary = "Rainfall deficit in eastern Ethiopia is contributing to Nairobi food stress through reduced grain output, trade pressure, and price inflation. The causal chain runs through agricultural decline, regional supply constraints, and wholesale price surges, compounded by transport costs and currency weakness. Estimated composite causal confidence: medium-high.";

export const getNodeById = (id: string) => nodes.find(n => n.id === id);
export const getEdgesBySource = (id: string) => edges.filter(e => e.sourceId === id);
export const getEdgesByTarget = (id: string) => edges.filter(e => e.targetId === id);
export const getUpstreamNodes = (id: string) => edges.filter(e => e.targetId === id).map(e => nodes.find(n => n.id === e.sourceId)!).filter(Boolean);
export const getDownstreamNodes = (id: string) => edges.filter(e => e.sourceId === id).map(e => nodes.find(n => n.id === e.targetId)!).filter(Boolean);

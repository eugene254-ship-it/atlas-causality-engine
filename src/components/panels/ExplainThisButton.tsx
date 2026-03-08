import { useDashboardStore } from '@/store/dashboardStore';
import { getNodeById, edges } from '@/data/causalData';
import { domainIcons } from '@/lib/domainUtils';
import { Lightbulb } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Pre-built explanations for each node (no AI needed)
const nodeExplanations: Record<string, string> = {
  'rainfall-deficit': 'Rainfall in eastern Ethiopia has fallen 38% below the seasonal average, driven by an Indian Ocean Dipole anomaly. This is the deepest root cause in the current chain — it directly reduces soil moisture and water availability for rain-fed agriculture, which dominates the region. Two consecutive below-average seasons have exhausted reserves.',
  'crop-output': 'Maize and sorghum yields in Oromia and SNNPR have declined 27% year-on-year, primarily because of sustained rainfall deficit. This is a direct, high-confidence link. While seed quality and pest outbreaks are possible confounders, satellite vegetation data strongly supports drought as the primary driver.',
  'grain-supply': 'Regional grain flows from Ethiopia to Kenya have fallen 31% by volume. Ethiopia is a key supplier to the East African grain market, and output declines reduce the exportable surplus. Government export restrictions may also play a role, but trade dependency analysis shows production decline is the stronger factor.',
  'grain-prices': 'Wholesale maize prices in Nairobi have surged 34% in 8 weeks. Three upstream forces converge here: reduced grain supply from Ethiopia (78% influence), rising transport costs (45%), and currency depreciation increasing import costs (35%). This is the critical amplification node — where multiple pressures combine to create a price shock that directly affects households.',
  'transport-costs': 'Freight costs on the Mombasa-Nairobi-Kampala corridor have risen 22% in 6 weeks due to fuel price increases and road disruptions. This is an independent contributor to grain price inflation, adding cost pressure on top of supply-side constraints.',
  'currency-weakness': 'The Kenyan shilling has weakened 8% against USD, increasing the local cost of imported grains and fuel. This is a structural factor that amplifies imported inflation but is less influential than direct supply constraints.',
  'food-stress': 'An estimated 2.4 million people in Nairobi are now experiencing food stress, with food constituting 40-60% of household spending in informal settlements. Grain price inflation is the primary driver (82% influence). This is the node where economic pressure translates into human impact.',
  'urban-dissatisfaction': 'Grievance sentiment in Nairobi informal settlements has risen to 72/100, driven primarily by food stress (68% influence). Social media monitoring and community reports indicate rising frustration, particularly when perceived as government failure. This is a lagging indicator — sentiment follows material conditions with a 2-6 week delay.',
  'protest-risk': 'Estimated probability of significant urban protests in Nairobi has reached 68% within the next 4 weeks. This is driven by sustained high grievance levels reducing the threshold for collective action. However, confidence is medium — protest prediction depends heavily on organizational triggers and security force posture that are harder to model.',
  'malnutrition': 'Acute malnutrition cases among children under 5 have increased 45%, directly linked to prolonged food insecurity (88% influence). This is a high-confidence, high-lag relationship — nutritional impacts manifest 3-8 weeks after food access declines. This is where the crisis becomes a health emergency.',
  'subsidy-pressure': 'Political pressure for emergency food subsidies is mounting, driven by both food stress visibility and protest risk. This represents the governance feedback loop — where system pressure forces policy responses that may or may not address root causes.',
};

const edgeExplanations: Record<string, string> = {
  'e-rainfall-crop': 'The link between rainfall deficit and crop output decline is one of the strongest and most well-evidenced in this chain (85% influence, high confidence). Reduced soil moisture directly decreases germination, growth, and yield in rain-fed systems. Satellite vegetation indices (NDVI) provide near-real-time confirmation. The 4-12 week lag reflects crop growth cycles.',
  'e-crop-grain': 'Ethiopia\'s role as a major regional grain supplier means that domestic output declines directly reduce exportable surplus (72% influence). This link operates through trade dependency networks with a 2-6 week lag as supply pipeline effects propagate to regional markets.',
  'e-grain-prices': 'Supply-demand imbalance from reduced grain availability pushes wholesale prices upward (78% influence). This is a textbook market mechanism with strong evidence from Nairobi wholesale data. However, speculative hoarding and import price movements are meaningful confounders.',
  'e-transport-prices': 'Higher freight costs are passed through to grain prices (45% influence, medium confidence). This is an independent amplifier — it would increase prices even without supply constraints, but the combined effect is multiplicative rather than additive.',
  'e-currency-prices': 'Currency weakness increases import costs for grains and inputs (35% influence). This is an indirect link — importers may absorb some costs through margin compression, which is why the influence is lower than direct supply factors.',
  'e-prices-food': 'The link from grain prices to household food stress is the strongest downstream connection (82% influence, high confidence). In informal settlements where food is 40-60% of spending, price increases directly translate into reduced food access with minimal lag.',
  'e-food-dissatisfaction': 'Food insecurity drives urban grievance (68% influence, medium confidence). The medium confidence reflects that dissatisfaction is mediated by perception — specifically whether people blame the government. Political mobilization and media amplification can accelerate or dampen this link.',
  'e-dissatisfaction-protest': 'Sustained grievance reduces the threshold for collective action (72% influence, medium confidence). The key uncertainty is organizational capacity — grievance alone doesn\'t cause protests, but it creates the conditions. The 1-4 week lag reflects mobilization timelines.',
  'e-food-malnutrition': 'Prolonged food insecurity directly degrades dietary quality (88% influence, high confidence). This is one of the most well-evidenced causal links in development literature. The 3-8 week lag reflects the time for nutritional status to measurably decline.',
  'e-food-subsidy': 'Visible food stress creates political imperative for subsidies (60% influence, medium confidence). This is a political economy link — it depends on electoral calculations and fiscal constraints as much as actual food stress levels.',
  'e-protest-subsidy': 'Protest risk accelerates government willingness to deploy subsidies as stabilization (55% influence). This is the coercive feedback loop — governments respond to threats of instability faster than to welfare needs.',
};

export default function ExplainThisButton() {
  const { selectedNodeId, selectedEdgeId } = useDashboardStore();
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const currentId = selectedNodeId || selectedEdgeId;
  
  // Reset when selection changes
  if (currentId !== lastSelectedId) {
    if (showExplanation) setShowExplanation(false);
    setLastSelectedId(currentId);
  }

  const explanation = useMemo(() => {
    if (selectedNodeId) return nodeExplanations[selectedNodeId];
    if (selectedEdgeId) return edgeExplanations[selectedEdgeId];
    return null;
  }, [selectedNodeId, selectedEdgeId]);

  if (!currentId || !explanation) return null;

  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;
  const edge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
      >
        <Lightbulb size={13} />
        {showExplanation ? 'Hide Explanation' : 'Explain This'}
      </button>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={12} className="text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
                    {node ? `Explaining: ${node.label}` : 'Causal Link Explanation'}
                  </span>
                </div>
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  {explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

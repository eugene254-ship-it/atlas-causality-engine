# Atlas Causality Dashboard

> **Atlas shows not just what is breaking, but the chain of causes making it break.**

The **Causality Dashboard** is Atlas's system explanation engine: an interactive interface for understanding **why complex systems are changing**, which upstream factors matter most, what downstream effects may follow, where causal uncertainty exists, and where interventions could break harmful chains.

It transforms disconnected metrics into **causal narratives**.

Instead of asking:

> "What metric moved?"

Atlas asks:

> **"What machinery is producing this outcome?"**

---

## 1. Product Overview

Modern decision-makers have access to enormous amounts of data, but dashboards often stop at description:

* rainfall is declining
* crop production is falling
* food prices are rising
* household stress is increasing
* civic tension is growing

The Causality Dashboard connects these signals into an interpretable system:

```text
Rainfall deficit
      ↓
Crop output decline
      ↓
Regional grain shortage
      ↓
Wholesale price increase
      ↓
Household food stress
      ↓
Urban dissatisfaction
      ↓
Civic tension
```

Every relationship is accompanied by evidence, confidence, uncertainty, timing, and alternative explanations.

The result is a **visual system for causal reasoning**, rather than another metric-monitoring dashboard.

---

# 2. Core Questions

The dashboard is designed to answer five fundamental questions:

### What is driving this crisis?

Identify the strongest upstream factors contributing to the selected outcome.

### Which upstream factors matter most?

Rank causal drivers by estimated influence, confidence, time lag, and downstream reach.

### What happens next?

Surface potential downstream effects and second-order consequences.

### Where can we intervene?

Identify leverage points where an intervention could disrupt harmful causal pathways.

### Where might we be wrong?

Expose uncertainty, confounders, competing models, alternative hypotheses, and evidence gaps.

---

# 3. Design Philosophy

The interface follows five principles:

### Causality over correlation

Observed relationships and inferred causal relationships are explicitly separated.

### Evidence over magic

Every important relationship should be inspectable.

### Uncertainty over false precision

Confidence ranges, competing models, and evidence quality are first-class UI elements.

### Time matters

A causal relationship without temporal context is incomplete.

### Intervention has consequences

Every intervention is presented alongside expected effects, uncertainty, dependencies, cost, and potential unintended consequences.

---

# 4. Core Experience

The dashboard consists of six primary zones.

## A. Causal Chain Canvas

The central interactive graph.

### Nodes

Represent:

* events
* conditions
* system states
* risks
* outcomes
* interventions

Example:

```text
Drought
   ↓
Crop Yield Decline
   ↓
Trade Pressure
   ↓
Grain Inflation
   ↓
Food Stress
```

### Edges

Represent directional influence.

Visual encoding includes:

* influence strength
* positive / negative polarity
* confidence
* direct / indirect relationship
* observed / inferred relationship
* evidence type

The graph should support:

* zoom
* pan
* node selection
* edge selection
* neighborhood expansion
* upstream highlighting
* downstream highlighting
* semantic clustering
* graph filtering
* pathway isolation
* animated causal flow

---

# 5. Root Drivers

The Root Drivers panel identifies the strongest upstream factors influencing the selected outcome.

Example:

| Driver             | Domain         | Causal Weight | Confidence |        Lag | Evidence |
| ------------------ | -------------- | ------------: | ---------: | ---------: | -------: |
| Grain inflation    | Economics      |          0.82 |       High |  1–3 weeks |       14 |
| Income compression | Economics      |          0.71 |     Medium |  2–6 weeks |        9 |
| Transport costs    | Infrastructure |          0.64 |     Medium |  1–4 weeks |        7 |
| Supply disruption  | Agriculture    |          0.59 |     Medium |  2–6 weeks |       11 |
| Rainfall deficit   | Climate        |          0.43 |     Medium | 1–3 months |       18 |

The goal is to distinguish:

**proximate causes**

from

**structural drivers.**

---

# 6. Downstream Consequences

Selecting a node reveals potential ripple effects.

For example:

```text
Grain Price Spike
       │
       ├──→ Food Stress ↑
       │
       ├──→ Nutrition Risk ↑
       │
       ├──→ Household Consumption ↓
       │
       ├──→ Subsidy Pressure ↑
       │
       └──→ Grievance Signals ↑
```

Each downstream relationship should expose:

* estimated effect
* confidence
* expected lag
* affected population
* evidence count
* uncertainty range

The system must clearly distinguish **forecast**, **historical pattern**, and **observed consequence**.

---

# 7. Evidence Inspector

The Evidence Inspector is the credibility layer of Atlas.

Every important causal edge should be inspectable.

Example:

### Crop Failure → Nairobi Grain Inflation

**Sources**

* satellite vegetation indices
* agricultural production data
* regional trade flows
* wholesale market prices

**Method**

Bayesian structural time series + trade dependency analysis

**Estimated lag**

2–6 weeks

**Confidence**

Medium

**Potential confounders**

* fuel price increases
* currency depreciation
* import bottlenecks
* transport disruption

**Alternative explanation**

Transport bottlenecks may explain a larger proportion of the observed price movement than agricultural output decline.

Evidence should be presented as evidence—not transformed into certainty by visual design.

---

# 8. Intervention Simulator

The Intervention Simulator transforms diagnosis into scenario analysis.

Users can test interventions such as:

* emergency grain subsidies
* transport corridor reopening
* strategic reserve release
* irrigation support
* targeted cash transfers
* import tariff changes
* supply-chain diversification

Each intervention displays:

```text
Intervention
     ↓
Target Node
     ↓
Affected Pathways
     ↓
Estimated Downstream Effects
     ↓
Time to Effect
```

### Intervention Card

Each action should include:

* target node
* estimated impact
* time to effect
* confidence
* cost band
* dependencies
* affected downstream nodes
* uncertainty interval
* unintended consequence risk

The simulator should never imply that a scenario is a guaranteed prediction.

---

# 9. Timeline Playback

Causality is temporal.

The timeline allows users to replay the evolution of a system over weeks, months, or years.

As the timeline moves:

* nodes appear
* relationships strengthen or weaken
* anomalies emerge
* interventions occur
* downstream effects develop
* evidence changes
* competing explanations become more or less plausible

Example:

```text
Jan       Feb       Mar       Apr       May

Rainfall ↓
          Crop Output ↓
                    Trade Pressure ↑
                              Grain Prices ↑
                                      Food Stress ↑
```

This allows analysts to examine whether a proposed causal sequence is temporally plausible.

---

# 10. Operating Modes

## Overview

Designed for executives and decision-makers.

Shows:

* active causal chains
* major root drivers
* sectors under compound pressure
* cross-border influence routes
* system fragility indicators
* high-priority evidence gaps

Minimal clutter.

Maximum signal.

---

## Investigation

Designed for analysts and researchers.

Features:

* full causal graph
* node expansion
* edge inspection
* evidence drawer
* domain filters
* geography filters
* model filters
* historical comparisons
* alternative explanations

Think:

> **Google Maps for systemic causation.**

---

## Compare

Compare two systems, regions, time periods, or causal explanations.

Examples:

```text
Nairobi vs Addis Ababa

Drought-driven explanation
vs
Transport-driven explanation
```

The interface highlights:

* shared causal pathways
* unique drivers
* divergent relationships
* evidence differences
* model disagreements

The objective is not to force one explanation, but to make competing explanations legible.

---

## Scenario

Explore hypothetical changes.

Examples:

```text
What if rainfall recovers?

What if fuel prices increase 20%?

What if a subsidy is introduced?

What if migration increases?

What if trade routes reopen?
```

Scenario outputs should include uncertainty bands and assumptions.

The UI should feel like **guided probabilistic reasoning**, not prophecy.

---

# 11. Primary Components

## Global Header

Contains:

* region selector
* time range
* issue selector
* model status
* last update
* alert severity

---

## Causal Graph

The primary visualization layer.

### Node encoding

Nodes may encode:

* domain
* severity
* confidence
* volatility
* intervention eligibility
* temporal status

### Edge encoding

Edges may encode:

* direction
* polarity
* strength
* confidence
* directness
* evidence type

---

## Chain Summary

A natural-language explanation of the selected pathway.

Example:

> **Rainfall deficits in eastern Ethiopia are contributing to food stress in Nairobi through reduced grain output, regional trade pressure, and wholesale price inflation. Estimated causal confidence: medium-high.**

The graph provides structure.

The sentence provides comprehension.

---

## Node Details Drawer

Displays:

* description
* current value
* trend
* upstream dependencies
* downstream impacts
* linked datasets
* anomaly history
* intervention relevance

Example:

```text
Nairobi Retail Maize Price

Current:
KES X/kg

Trend:
+12% / 4 weeks

Upstream:
• Transport cost
• Grain shortage
• Currency weakness

Downstream:
• Food stress
• Nutrition risk
• Grievance signals
```

---

## Edge Details Drawer

Displays:

* relationship description
* mechanism
* evidence
* causal method
* lag
* strength
* uncertainty
* historical examples
* confounders
* alternative hypotheses

This is the ethical backbone of the product.

---

## Filters

Filter by:

* domain
* geography
* institution
* risk level
* confidence
* time lag
* directness
* model type
* evidence quality
* observed / inferred
* historical / current / predicted

---

# 12. AI Reasoning Assistant

Atlas includes a graph-grounded reasoning assistant.

Users can ask:

> Why is this node rising?

> What are the strongest upstream drivers?

> What changed in the last 30 days?

> Which evidence supports this edge?

> What are the alternative explanations?

> Where could an intervention disrupt the chain?

The assistant should answer from:

1. the current causal graph
2. selected evidence
3. model outputs
4. historical observations
5. scenario assumptions

It should not invent causal relationships outside the evidence model.

---

# 13. Data Model

## Node

```ts
interface CausalNode {
  id: string;
  label: string;
  type: NodeType;
  domain: Domain;
  geography?: string;

  timestampRange: {
    start: string;
    end?: string;
  };

  stateValue?: number;
  changeDelta?: number;
  severity?: number;

  confidence: number;
  evidenceCount: number;

  interventionEligible: boolean;
}
```

## Edge

```ts
interface CausalEdge {
  id: string;

  sourceId: string;
  targetId: string;

  polarity: "positive" | "negative";

  influenceStrength: number;
  confidence: number;

  lagMin?: number;
  lagMax?: number;

  methodType: string;

  directness: "direct" | "indirect";

  evidenceRefs: string[];

  alternateHypotheses: string[];
}
```

## Chain

```ts
interface CausalChain {
  id: string;

  rootCauseIds: string[];

  targetOutcomeId: string;

  pathNodes: string[];
  pathEdges: string[];

  compositeConfidence: number;

  narrativeSummary: string;
}
```

## Intervention

```ts
interface Intervention {
  id: string;

  label: string;

  targetNodeIds: string[];

  estimatedImpact: number;

  timeToEffect: {
    min: number;
    max: number;
  };

  confidence: number;

  riskScore: number;

  costBand: "low" | "medium" | "high";
}
```

---

# 14. Frontend Architecture

Recommended stack:

```text
Next.js
   │
   ├── React
   ├── TypeScript
   └── Tailwind CSS
        │
        ├── TanStack Query
        ├── Zustand / Redux Toolkit
        │
        ├── React Flow
        ├── D3
        ├── ECharts / Recharts
        │
        └── Mapbox / Deck.gl
```

### Responsibilities

**React / Next.js**

Application architecture and routing.

**TypeScript**

Strong domain contracts and safer data flow.

**Tailwind**

Consistent design system implementation.

**TanStack Query**

Server state, caching, synchronization, and async data.

**Zustand / Redux Toolkit**

Graph interaction and application state.

**D3**

Graph algorithms, scales, calculations, and advanced visualization logic.

**React Flow**

Interactive node-edge experiences.

**Canvas / WebGL**

High-density graph rendering where DOM rendering becomes insufficient.

**ECharts / Recharts**

Supporting time series and analytical charts.

**Mapbox / Deck.gl**

Geospatial causal overlays.

---

# 15. Performance Architecture

Large causal graphs can become computationally expensive.

Atlas should therefore use:

### Progressive graph loading

Initially load:

```text
selected node
     ↓
nearest causal neighborhood
     ↓
expanded branches on demand
```

### Semantic clustering

Group nodes by:

* domain
* geography
* institution
* causal subsystem

### Server-side layout

Precompute expensive layouts where practical.

### Lazy evidence loading

Evidence is fetched when a relationship is inspected rather than loading the entire evidence universe.

### Cached expansions

Repeatedly explored causal neighborhoods should be cached.

### Virtualized panels

Large evidence lists and ranking tables should use virtualization.

### Debounced filters

Avoid recomputing graph state for every keystroke.

### Rendering strategy

Use SVG for small/medium networks.

Use Canvas/WebGL for dense networks.

---

# 16. Visual System

Atlas should feel like:

* mission control
* systems intelligence
* forensic analysis
* strategic calm

It should **not** feel like:

* crypto dashboard soup
* neural-network wallpaper
* a cyberpunk casino
* "Dr. Strange casting spells in D3.js"

### Default

Dark mode.

### Domain language

| Domain           | Visual Accent |
| ---------------- | ------------- |
| Climate          | Teal          |
| Agriculture      | Green         |
| Economics        | Amber         |
| Infrastructure   | Blue          |
| Governance       | Purple        |
| Social Stability | Red           |
| Health           | Cyan          |

Color should communicate meaning, not decoration.

Stress escalation should use red/orange sparingly.

Stabilizing forces can use blue/green.

The graph itself should remain visually restrained.

---

# 17. Interaction Principles

### Hover

Preview:

* top upstream causes
* top downstream effects

without changing application state.

### Click

Lock the selected node or edge.

Dim unrelated pathways.

### Explain This

Convert the selected pathway into a concise natural-language explanation.

### Show Alternatives

Expose competing causal explanations and their supporting evidence.

### Break the Chain

Highlight potential intervention points.

### Time Rewind

Move backward through the system to identify when causal relationships changed.

---

# 18. Credibility Framework

Atlas should enforce a strict distinction between:

```text
OBSERVED
   ↓
MODELED
   ↓
INFERRED
   ↓
SCENARIO
```

These states must never visually collapse into one another.

Every causal relationship should expose:

* confidence
* evidence quality
* method
* temporal lag
* uncertainty
* potential confounders
* alternative explanations

### Example

```text
Observed:
Wholesale grain prices increased 12%.

Modeled:
Transport disruption explains an estimated portion of the movement.

Inferred:
Transport disruption may have amplified the effect of regional supply decline.

Scenario:
If transport capacity recovers, modeled price pressure may decrease.
```

This distinction is fundamental to the product.

---

# 19. Model Disagreement

When models disagree, Atlas should make the disagreement visible.

Example:

```text
MODEL A

Drought
   ↓
Primary driver

Confidence: Medium


MODEL B

Transport bottleneck
   ↓
Primary driver

Confidence: Medium


SHARED EVIDENCE

Supply disruption is associated
with elevated grain prices.

Evidence gap:

Updated regional trade-flow data
```

The interface should never manufacture consensus where none exists.

---

# 20. Empty States

When evidence is insufficient:

```text
INSUFFICIENT EVIDENCE

Atlas cannot establish a reliable
causal pathway for this relationship.

Available:
• Correlation data
• Historical observations

Missing:
• Updated trade-flow data
• Regional production estimates

Known blind spots:
• Informal markets
• Delayed reporting

Recommendation:
Acquire additional evidence before
using this pathway for intervention analysis.
```

No fabricated causality.

No mystery score.

No dashboard theater.

---

# 21. System KPIs

Atlas should expose system-level indicators such as:

### Root Driver Strength

Estimated contribution of major upstream factors.

### Chain Depth

Number of meaningful causal stages.

### Downstream Breadth

Number of affected downstream systems.

### Average Confidence

Aggregate confidence across the selected pathway.

### Intervention Leverage

Estimated potential for disrupting downstream effects.

### Time to Impact

Expected temporal distance between intervention and effect.

### Cross-Border Dependency

Degree of causal dependence across geographic boundaries.

### Systemic Fragility

Composite indicator of interconnected pressure and uncertainty.

These metrics should be accompanied by definitions and methodology rather than presented as universal truths.

---

# 22. MVP

The first release should **not** attempt to model the entire planet.

Start with one causal domain:

```text
Climate
   ↓
Agriculture
   ↓
Prices
   ↓
Food Stress
   ↓
Civic Tension
```

### MVP features

* interactive causal graph
* node inspection
* edge inspection
* root-driver ranking
* downstream effects
* confidence visualization
* evidence panel
* timeline playback
* alternative explanations
* 2–3 intervention scenarios
* graph-grounded AI explanation

That is enough to demonstrate the core product.

---

# 23. Example MVP Scenario

### Selected issue

**Urban Food Stress — Nairobi**

### Causal chain

```text
Rainfall Deficit
        ↓
Agricultural Output Decline
        ↓
Regional Grain Availability ↓
        ↓
Wholesale Grain Prices ↑
        ↓
Retail Food Prices ↑
        ↓
Household Purchasing Power ↓
        ↓
Food Stress ↑
```

### Root Drivers

```text
1. Grain price inflation
2. Household income compression
3. Transport costs
4. Regional supply disruption
5. Agricultural output decline
6. Currency pressure
```

### Potential Interventions

```text
Strategic reserve release
        ↓
Wholesale supply
        ↓
Price pressure
        ↓
Food stress
```

or:

```text
Transport corridor intervention
        ↓
Distribution capacity
        ↓
Regional availability
        ↓
Price pressure
```

Each pathway should expose its own assumptions and uncertainty.

---

# 24. Example User Flow

```text
Open Atlas
    ↓
Select Region
    ↓
Select Issue
    ↓
View Causal Summary
    ↓
Inspect Main Chain
    ↓
Select Root Driver
    ↓
Inspect Evidence
    ↓
Review Alternative Explanations
    ↓
Explore Downstream Effects
    ↓
Open Intervention Simulator
    ↓
Run Scenario
    ↓
Compare Results
    ↓
Review Uncertainty
    ↓
Export Explanation
```

---

# 25. Success Criteria

The dashboard succeeds when a user can move from:

> "Something is getting worse."

to:

> "Here is the most supported causal pathway explaining the change."

and then:

> "Here are the competing explanations."

and finally:

> "Here are the intervention points, expected effects, timing, tradeoffs, and remaining uncertainties."

without needing to understand the underlying graph engine.

---

# 26. Product Positioning

### Long version

> **The Causality Dashboard helps leaders trace how environmental, economic, and governance pressures interact to create systemic crises—so they can understand where pressure originates, how it propagates, where uncertainty remains, and where interventions may disrupt harmful chains.**

### Short version

> **Atlas shows not just what is breaking, but the chain of causes making it break.**

### Product category

**Systemic Causal Intelligence**

### Core metaphor

**A map of why.**

---

# 27. North Star

Traditional dashboards answer:

> **What happened?**

Analytics platforms answer:

> **What changed?**

Predictive systems answer:

> **What might happen?**

Atlas aims to answer:

> **Why is it happening, what could happen next, what else could explain it, and where could the chain be interrupted?**

That is the Causality Dashboard.

Not a prettier KPI screen.

Not a graph with arrows.

A visual reasoning system for complex, interconnected worlds.

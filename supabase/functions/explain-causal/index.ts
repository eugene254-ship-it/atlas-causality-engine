import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Atlas, a causal analysis engine for policy leaders. You explain causal relationships in crisis systems with precision, evidence awareness, and intellectual honesty.

Rules:
- Be concise but thorough (2-3 paragraphs max)
- Always mention confidence levels and key uncertainties
- Reference specific data points from the context provided
- Distinguish observed facts from inferred relationships
- Mention time lags and their significance
- If relevant, note alternative explanations
- Use plain language suitable for policy leaders, not academics
- Never fabricate evidence or overstate certainty`;

    let userPrompt = "";
    if (type === "node") {
      userPrompt = `Explain this causal node in the crisis chain:

Node: ${context.label}
Domain: ${context.domain}
Current Value: ${context.currentValue || "N/A"}
Change: ${context.changeDelta || "N/A"}
Severity: ${context.severity}
Confidence: ${context.confidence}
Evidence Sources: ${context.evidenceCount} sources
Description: ${context.description}
Upstream Dependencies: ${context.upstreamNodes?.join(", ") || "None (root cause)"}
Downstream Impacts: ${context.downstreamNodes?.join(", ") || "None (terminal)"}
Intervention Eligible: ${context.interventionEligible ? "Yes" : "No"}

Explain what this node represents, why it matters in the causal chain, and what leaders should understand about it.`;
    } else if (type === "edge") {
      userPrompt = `Explain this causal link in the crisis chain:

Link: ${context.sourceLabel} → ${context.targetLabel}
Polarity: ${context.polarity}
Influence Strength: ${Math.round(context.influenceStrength * 100)}%
Confidence: ${context.confidence}
Time Lag: ${context.lagMin}-${context.lagMax} weeks
Method: ${context.methodType}
Directness: ${context.directness}
Mechanism: ${context.mechanism}
Confounders: ${context.confounders?.join(", ") || "None identified"}
Alternative Hypotheses: ${context.alternateHypotheses?.join("; ") || "None"}
Evidence Sources: ${context.evidenceSources?.join(", ") || "Not specified"}

Explain the causal mechanism, evidence quality, key uncertainties, and what policy leaders should know about this link.`;
    } else if (type === "alternatives") {
      userPrompt = `Generate competing alternative explanations for this causal link, ranked by plausibility:

Link: ${context.sourceLabel} (${context.sourceDomain}) → ${context.targetLabel} (${context.targetDomain})
Current Mechanism: ${context.mechanism}
Influence Strength: ${Math.round(context.influenceStrength * 100)}%
Confidence: ${context.confidence}
Known Confounders: ${context.confounders?.join(", ") || "None identified"}
Existing Alternative Hypotheses: ${context.alternateHypotheses?.join("; ") || "None"}
Evidence Sources: ${context.evidenceSources?.join(", ") || "Not specified"}

Provide 3-4 competing explanations for the observed relationship between ${context.sourceLabel} and ${context.targetLabel}. For each:
1. Name the alternative hypothesis
2. Rate its plausibility (High/Medium/Low)
3. Explain the mechanism
4. Note what evidence would confirm or refute it

Rank them from most to least plausible. Use markdown formatting with headers.`;
    } else if (type === "break_chain") {
      userPrompt = `Recommend intervention strategy for breaking the causal chain at this node:

Node: ${context.label}
Domain: ${context.domain}
Current Value: ${context.currentValue || "N/A"}
Severity: ${context.severity}
Confidence: ${context.confidence}
Description: ${context.description}
Downstream Effects: ${context.downstreamNodes?.join(", ") || "None"}

Available Interventions:
${context.availableInterventions?.map((i: { label: string; estimatedImpact: number; timeToEffect: string; costBand: string; risks: string[] }) =>
  `- ${i.label}: Impact ${Math.round(i.estimatedImpact * 100)}%, Time ${i.timeToEffect}, Cost ${i.costBand}, Risks: ${i.risks.join(", ")}`
).join("\n") || "None defined"}

Provide a strategic recommendation for policy leaders:
1. Which intervention(s) to prioritize and why
2. Sequencing and timing considerations
3. Key risks and mitigations
4. Expected downstream impact reduction
5. What to monitor for effectiveness

Be specific, actionable, and honest about trade-offs. Use markdown formatting.`;
  } else if (type === "policy_briefing") {
      userPrompt = `Generate a comprehensive policy briefing document based on this causal chain analysis:

## Chain Overview
${context.chainSummary}

## Scale
- ${context.totalNodes} causal factors across multiple domains
- ${context.totalEdges} causal links identified
- ${context.interventionEligibleCount} nodes eligible for intervention

## Critical Factors (Immediate Attention Required)
${context.criticalFactors?.map((f: { label: string; domain: string; currentValue: string; changeDelta: string }) =>
  `- **${f.label}** (${f.domain}): ${f.currentValue} | Change: ${f.changeDelta}`
).join("\n") || "None"}

## High Risk Factors
${context.highRiskFactors?.map((f: { label: string; domain: string; currentValue: string }) =>
  `- **${f.label}** (${f.domain}): ${f.currentValue}`
).join("\n") || "None"}

## Available Interventions
${context.topInterventions?.map((i: { label: string; estimatedImpact: number; timeToEffect: string; costBand: string; risks: string[] }) =>
  `- **${i.label}**: ${Math.round(i.estimatedImpact * 100)}% impact, ${i.timeToEffect}, ${i.costBand} cost | Risks: ${i.risks.join(", ")}`
).join("\n") || "None"}

## Domain Breakdown
${context.domainBreakdown?.map(([d, c]: [string, number]) => `- ${d}: ${c} factors`).join("\n") || "N/A"}

---

Generate a structured policy briefing with: Executive Summary, Situation Assessment, Risk Assessment, Causal Analysis, Recommended Actions (Immediate/Short-term/Medium-term), Resource Requirements, Monitoring Framework, and Confidence & Limitations. Use markdown formatting. Be specific, data-driven, and actionable.`;
    } else if (type === "anomaly_analysis") {
      userPrompt = `Analyze this anomaly detected in trend monitoring data:

Node: ${context.nodeLabel}
Domain: ${context.domain}
Anomaly Type: ${context.anomalyType}
Month: ${context.month}
Magnitude: ${context.magnitude}
Current Severity: ${context.severity}
Current Value: ${context.currentValue || "N/A"}

Trend Data (12 months): ${context.trendData}

Description: ${context.description}

Provide a brief analysis (2-3 paragraphs):
1. What likely caused this anomaly
2. Whether it signals a systemic shift or is likely transient
3. What actions should be taken in response
4. What to monitor going forward

Be specific and reference the data points provided.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("explain-causal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

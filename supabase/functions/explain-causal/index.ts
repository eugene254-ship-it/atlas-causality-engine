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

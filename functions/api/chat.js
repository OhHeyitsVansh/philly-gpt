export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return json({ error: "Missing 'message' string" }, 400);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: "Server misconfigured: missing OPENAI_API_KEY" }, 500);
    }

    const systemInstructions = `
You are Philly GPT, a helpful civic assistant for Philadelphia.
- Give practical steps and point users to official sources.
- If unsure, say what you don't know and what to check next.
- Don't request sensitive personal info. For emergencies: 911.
`.trim();

    const openaiResp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        instructions: systemInstructions,
        input: message,
        max_output_tokens: 400,
        store: false
      }),
    });

    const data = await openaiResp.json();
    if (!openaiResp.ok) {
      return json({ error: data?.error?.message || "OpenAI API error" }, 502);
    }

    const text = extractOutputText(data);
    return json({ text });
  } catch (err) {
    return json({ error: err?.message || "Server error" }, 500);
  }
}

function extractOutputText(responseJson) {
  const out = responseJson?.output || [];
  const chunks = [];
  for (const item of out) {
    if (item?.type === "message" && item?.role === "assistant") {
      for (const c of item?.content || []) {
        if (c?.type === "output_text" && typeof c?.text === "string") {
          chunks.push(c.text);
        }
      }
    }
  }
  return chunks.join("\n").trim() || "Sorry — I couldn’t generate a response.";
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return json({ error: "Missing 'message' (string)." }, 400);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: "Missing OPENAI_API_KEY in Cloudflare Pages Secrets." }, 500);
    }

    const instructions = `
You are Philly GPT, a helpful civic assistant for Philadelphia.
Give practical steps and suggest official sources to verify details.
Do not request sensitive personal info. For emergencies: 911.
If a question is not Philly-related, still help but keep it concise.
`.trim();

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        instructions,
        input: message,
        max_output_tokens: 350,
        store: false
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return json({ error: data?.error?.message || "OpenAI API error" }, 502);
    }

    return json({ text: extractText(data) });
  } catch (err) {
    return json({ error: err?.message || "Server error" }, 500);
  }
}

function extractText(res) {
  const out = res?.output || [];
  const parts = [];

  for (const item of out) {
    if (item?.type === "message" && item?.role === "assistant") {
      for (const c of item?.content || []) {
        if (c?.type === "output_text" && typeof c?.text === "string") {
          parts.push(c.text);
        }
      }
    }
  }
  return parts.join("\n").trim() || "Sorry — I couldn’t generate a response.";
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

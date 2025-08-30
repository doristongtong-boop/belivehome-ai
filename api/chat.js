// api/chat.js — Vercel (CommonJS) 版本
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.status(405).json({ error: "Only POST allowed" });
    }

    // 兼容某些环境 body 是字符串
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (_) {}
    }
    const message = body && typeof body.message === "string" ? body.message : "";
    if (!message) {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }

    const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      }),
    });

    const payload = await oaRes.json();

    if (!oaRes.ok) {
      // 打印到函数日志，同时把 OpenAI 的报错透出给前端
      console.error("OpenAI API error:", payload);
      return res.status(oaRes.status || 502).json({ error: "OpenAI error", details: payload });
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (!text) {
      console.error("Invalid OpenAI response:", payload);
      return res.status(500).json({ error: "Invalid response from OpenAI", details: payload });
    }

    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
};

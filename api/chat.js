// api/chat.js  —— CommonJS 版本
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "OpenAI error", details: data });
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: "Invalid response from OpenAI", details: data });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
};

if (!response.ok) {
  console.error("❌ OpenAI API error:", data); // 打印到 Vercel 日志
  return res.status(502).json({ error: "OpenAI error", details: data });
}

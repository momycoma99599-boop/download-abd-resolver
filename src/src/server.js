import express from "express";
import youtubeDl from "youtube-dl-exec";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
const allowedProtocols = new Set(["http:", "https:"]);
const qualities = new Set(["best", "1080p", "720p", "480p", "360p", "144p"]);
function validateUrl(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 4096) throw new Error("الرابط غير صالح");
  const parsed = new URL(value);
  if (!allowedProtocols.has(parsed.protocol) || parsed.username || parsed.password) throw new Error("يسمح فقط برابط http أو https صالح");
  return parsed.toString();
}
function formatFor(kind, quality) {
  if (kind === "audio") return "bestaudio[ext=m4a]/bestaudio/best";
  if (quality === "best") return "best[ext=mp4]/best";
  const height = Number.parseInt(quality, 10);
  return Number.isFinite(height) ? `best[height<=${height}][ext=mp4]/best[height<=${height}]/best` : "best[ext=mp4]/best";
}
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "download-abd-resolver" }));
app.post("/api/resolve", async (req, res) => {
  try {
    const { url: input, format = "video", quality = "best", allowAgeRestricted = false } = req.body || {};
    const url = validateUrl(input);
    if (!["video", "audio"].includes(format)) return res.status(400).json({ error: "الصيغة يجب أن تكون video أو audio" });
    if (!qualities.has(quality)) return res.status(400).json({ error: "الجودة غير مدعومة" });
    const info = await youtubeDl(url, { dumpSingleJson: true, noWarnings: true, noPlaylist: true, skipDownload: true, format: formatFor(format, quality), socketTimeout: 25, retries: 2, extractorArgs: "youtube:player_client=android,web_safari" });
    if (!allowAgeRestricted && Number(info?.age_limit || 0) > 0) throw new Error("المحتوى مقيّد عمريًا");
    const mediaUrl = info?.url || info?.requested_formats?.[0]?.url;
    if (typeof mediaUrl !== "string" || !mediaUrl) throw new Error("لم يتم العثور على ملف وسائط قابل للتنزيل");
    res.json({ url: mediaUrl, title: typeof info.title === "string" ? info.title : "ملف من الرابط", ext: info.ext || (format === "audio" ? "m4a" : "mp4"), duration: typeof info.duration === "number" ? info.duration : null, extractor: info.extractor_key || "unknown" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحليل الرابط";
    console.error("[resolve]", message);
    res.status(422).json({ error: message });
  }
});
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`Download ABD resolver listening on ${port}`));


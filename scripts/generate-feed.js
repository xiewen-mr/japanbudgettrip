const fs = require("fs");

const siteUrl = "https://japanbudgettrip.com";
const guideFiles = fs
  .readdirSync("guides")
  .filter((file) => file.endsWith(".html") && file !== "index.html")
  .map((file) => `guides/${file}`);

function match(html, pattern) {
  return (html.match(pattern) || [])[1] || "";
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(`${value} UTC`).toISOString().slice(0, 10);
}

function toRssDate(value) {
  return new Date(`${value}T00:00:00Z`).toUTCString();
}

const items = guideFiles
  .map((file) => {
    const html = fs.readFileSync(file, "utf8");
    const title = decodeHtml(match(html, /<title>([\s\S]*?)<\/title>/));
    const description = match(html, /<meta name="description" content="([^"]*)">/);
    const link = match(html, /<link rel="canonical" href="([^"]*)">/);
    const modified =
      match(html, /"dateModified": "([^"]+)"/) ||
      decodeHtml(match(html, /<div class="article-meta"><span>Updated ([^<]+)<\/span>/));

    if (!title || !description || !link || !modified) {
      throw new Error(`Missing feed metadata in ${file}`);
    }

    return {
      title,
      description,
      link,
      modified: toIsoDate(modified)
    };
  })
  .sort((left, right) => right.modified.localeCompare(left.modified) || left.title.localeCompare(right.title));

const lines = [
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
  "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">",
  "  <channel>",
  "    <title>Japan Budget Trip Guides</title>",
  "    <link>https://japanbudgettrip.com/guides/</link>",
  "    <atom:link href=\"https://japanbudgettrip.com/feed.xml\" rel=\"self\" type=\"application/rss+xml\"/>",
  "    <description>Practical Japan budget travel guides for costs, routes, hotels, transport, airports, eSIMs, and day trips.</description>",
  "    <language>en</language>",
  `    <lastBuildDate>${toRssDate(items[0].modified)}</lastBuildDate>`
];

for (const item of items) {
  lines.push(
    "    <item>",
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${escapeXml(item.link)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
    `      <description>${escapeXml(item.description)}</description>`,
    `      <pubDate>${toRssDate(item.modified)}</pubDate>`,
    "    </item>"
  );
}

lines.push("  </channel>", "</rss>");

fs.writeFileSync("feed.xml", `${lines.join("\n")}\n`);
console.log(`Wrote feed.xml with ${items.length} items from ${siteUrl}`);

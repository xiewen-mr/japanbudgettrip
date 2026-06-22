const fs = require("fs");

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

function toIsoDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(`${value} UTC`).toISOString().slice(0, 10);
}

const guides = guideFiles
  .map((file) => {
    const html = fs.readFileSync(file, "utf8");
    const title = decodeHtml(match(html, /<title>([\s\S]*?)<\/title>/));
    const description = match(html, /<meta name="description" content="([^"]*)">/);
    const url = match(html, /<link rel="canonical" href="([^"]*)">/);
    const modified =
      match(html, /"dateModified": "([^"]+)"/) ||
      decodeHtml(match(html, /<div class="article-meta"><span>Updated ([^<]+)<\/span>/));

    if (!title || !description || !url || !modified) {
      throw new Error(`Missing LLM metadata in ${file}`);
    }

    return {
      title,
      description,
      url,
      modified: toIsoDate(modified)
    };
  })
  .sort((left, right) => right.modified.localeCompare(left.modified) || left.title.localeCompare(right.title));

const lines = [
  "# Japan Budget Trip",
  "",
  "> Practical Japan budget travel guides for first-time visitors planning costs, routes, hotels, transport, airports, eSIMs, insurance, taxes, luggage, and day trips.",
  "",
  "This site is designed for travelers who need booking decisions, not broad destination inspiration. Use the guides to compare budget ranges, city order, airport transfers, hotel areas, rail/pass choices, day trips, internet options, and checkout costs.",
  "",
  "## Core Pages",
  "",
  "- [Home](https://japanbudgettrip.com/): budget calculator, route remix, guide shortcuts, and planning tools.",
  "- [Routes](https://japanbudgettrip.com/routes/): 5, 7, and 10 day Japan itinerary route choices.",
  "- [Calendar](https://japanbudgettrip.com/calendar/): 2026 Japan travel timing by month, public holiday pressure, crowds, heat, typhoons, and autumn route fit.",
  "- [Guides](https://japanbudgettrip.com/guides/): full guide directory by region and planning problem.",
  "- [Resources](https://japanbudgettrip.com/resources/): planning resources before checkout.",
  "- [Price Notes](https://japanbudgettrip.com/price-notes/): source notes and price-checking assumptions.",
  "- [RSS Feed](https://japanbudgettrip.com/feed.xml): latest guide feed.",
  "",
  "## Guides",
  ""
];

for (const guide of guides) {
  lines.push(`- [${guide.title}](${guide.url}) - Updated ${guide.modified}. ${guide.description}`);
}

lines.push(
  "",
  "## Content Notes",
  "",
  "- Costs are planning ranges before international flights unless a guide says otherwise.",
  "- Travelers should verify official prices, pass rules, opening hours, and cancellation terms before booking.",
  "- The site prioritizes practical route fit and total trip cost over generic travel inspiration."
);

fs.writeFileSync("llms.txt", `${lines.join("\n")}\n`);
console.log(`Wrote llms.txt with ${guides.length} guide links`);

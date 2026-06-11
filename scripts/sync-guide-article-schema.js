const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GUIDES_DIR = path.join(ROOT, "guides");
const SITE_NAME = "Japan Budget Trip";

function extract(source, pattern, label, file) {
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Missing ${label} in ${file}`);
  }
  return decodeHtml(match[1].trim());
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toIsoDate(value, file) {
  const date = new Date(`${value} UTC`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Could not parse updated date "${value}" in ${file}`);
  }
  return date.toISOString().slice(0, 10);
}

function findJsonLdBlocks(source) {
  return [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => ({
    full: match[0],
    json: JSON.parse(match[1]),
  }));
}

function createArticleSchema(source, file) {
  const title = extract(source, /<title>(.*?)<\/title>/, "title", file);
  const description = extract(source, /<meta name="description" content="([^"]+)">/, "description", file);
  const canonical = extract(source, /<link rel="canonical" href="([^"]+)">/, "canonical", file);
  const image = extract(source, /<meta property="og:image" content="([^"]+)">/, "og:image", file);
  const updated = extract(source, /<div class="article-meta"><span>Updated ([^<]+)<\/span>/, "updated date", file);
  const date = toIsoDate(updated, file);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: canonical,
    image,
  };
}

function formatJsonLd(schema) {
  const json = JSON.stringify(schema, null, 8)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
  return `    <script type="application/ld+json">\n${json}\n    </script>\n`;
}

const guideFiles = fs
  .readdirSync(GUIDES_DIR)
  .filter((file) => file.endsWith(".html") && file !== "index.html")
  .sort();

let changed = 0;

for (const guideFile of guideFiles) {
  const file = path.join(GUIDES_DIR, guideFile);
  const relativeFile = path.relative(ROOT, file);
  const source = fs.readFileSync(file, "utf8");
  const blocks = findJsonLdBlocks(source);
  const articleBlock = blocks.find((block) => block.json["@type"] === "Article");
  const schema = createArticleSchema(source, relativeFile);

  if (articleBlock) {
    const normalized = {
      ...articleBlock.json,
      image: articleBlock.json.image || schema.image,
    };
    if (JSON.stringify(normalized) === JSON.stringify(articleBlock.json)) {
      continue;
    }

    const next = source.replace(articleBlock.full, formatJsonLd(normalized).trimEnd());
    fs.writeFileSync(file, next);
    changed += 1;
    continue;
  }

  const firstJsonLd = source.match(/    <script type="application\/ld\+json">\n/);
  if (!firstJsonLd) {
    throw new Error(`Could not find JSON-LD insertion point in ${relativeFile}`);
  }

  const next = source.replace(firstJsonLd[0], `${formatJsonLd(schema)}${firstJsonLd[0]}`);
  fs.writeFileSync(file, next);
  changed += 1;
}

console.log(`Synced Article JSON-LD in ${changed} guide files.`);

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const siteUrl = "https://japanbudgettrip.com";
const root = process.cwd();
const problems = [];

function fail(message) {
  problems.push(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function trackedFiles() {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

function stripUrl(value) {
  return value.split("#")[0].split("?")[0];
}

function isExternal(value) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value);
}

function isIgnorableUrl(value) {
  return (
    !value ||
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:") ||
    value.startsWith("data:") ||
    isExternal(value)
  );
}

function normalizeLocalUrl(value, fromFile) {
  const clean = stripUrl(value);
  if (!clean) return "";

  if (clean.startsWith("/")) {
    return clean.replace(/^\/+/, "") || "index.html";
  }

  const base = path.dirname(fromFile);
  return path.normalize(path.join(base, clean)).replace(/\\/g, "/");
}

function localTargetExists(target) {
  if (!target) return true;
  if (exists(target)) return true;
  if (target.endsWith("/")) return exists(path.join(target, "index.html"));
  if (!path.extname(target)) {
    return exists(`${target}.html`) || exists(path.join(target, "index.html"));
  }
  return false;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

function allMatches(content, pattern) {
  return [...content.matchAll(pattern)].map((match) => match[1]);
}

const files = trackedFiles();
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const guideFiles = htmlFiles.filter((file) => file.startsWith("guides/") && file !== "guides/index.html");
const sitemap = read("sitemap.xml");
const feed = read("feed.xml");
const llms = read("llms.txt");
const sitemapLocs = new Set(allMatches(sitemap, /<loc>([^<]+)<\/loc>/g).map(decodeXml));
const feedLinks = new Set(allMatches(feed, /<link>([^<]+)<\/link>/g).map(decodeXml));

function checkJsonLd(file, html) {
  const blocks = allMatches(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const block of blocks) {
    try {
      JSON.parse(block);
    } catch (error) {
      fail(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
}

function checkLocalReferences(file, html) {
  const references = [
    ...allMatches(html, /\s(?:href|src)="([^"]+)"/g),
    ...allMatches(html, /\ssrcset="([^"]+)"/g).flatMap((srcset) =>
      srcset.split(",").map((part) => part.trim().split(/\s+/)[0])
    )
  ];

  for (const reference of references) {
    if (isIgnorableUrl(reference)) continue;
    const target = normalizeLocalUrl(reference, file);
    if (!localTargetExists(target)) {
      fail(`${file}: missing local reference ${reference} -> ${target}`);
    }
  }
}

function checkCssUrls(file, content) {
  for (const reference of allMatches(content, /url\(["']?([^"')]+)["']?\)/g)) {
    if (isIgnorableUrl(reference)) continue;
    const target = normalizeLocalUrl(reference, file);
    if (!localTargetExists(target)) {
      fail(`${file}: missing CSS url ${reference} -> ${target}`);
    }
  }
}

function checkPageMetadata(file, html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const description = (html.match(/<meta\s+name="description"\s+content="([^"]+)"\s*>/) || [])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];

  if (!title) fail(`${file}: missing <title>`);
  if (!description) fail(`${file}: missing meta description`);
  if (!canonical) {
    fail(`${file}: missing canonical link`);
    return;
  }

  if (!canonical.startsWith(siteUrl)) {
    fail(`${file}: canonical is outside site URL: ${canonical}`);
  }

  if (!sitemapLocs.has(canonical)) {
    fail(`${file}: canonical missing from sitemap: ${canonical}`);
  }
}

for (const file of htmlFiles) {
  const html = read(file);
  checkJsonLd(file, html);
  checkLocalReferences(file, html);
  checkPageMetadata(file, html);
}

for (const file of files.filter((item) => item.endsWith(".css"))) {
  checkCssUrls(file, read(file));
}

for (const file of guideFiles) {
  const html = read(file);
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
  if (!canonical) continue;
  if (!feedLinks.has(canonical)) fail(`${file}: guide canonical missing from feed.xml`);
  if (!llms.includes(`](${canonical})`)) fail(`${file}: guide canonical missing from llms.txt`);
}

for (const required of [
  `${siteUrl}/`,
  `${siteUrl}/guides/`,
  `${siteUrl}/routes/`,
  `${siteUrl}/calendar/`,
  `${siteUrl}/resources/`,
  `${siteUrl}/feed.xml`,
  `${siteUrl}/llms.txt`
]) {
  if (!sitemapLocs.has(required)) fail(`sitemap.xml: missing required URL ${required}`);
}

if (problems.length) {
  console.error(`Site check failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Site check passed: ${htmlFiles.length} HTML pages, ${guideFiles.length} guide pages, ${sitemapLocs.size} sitemap URLs.`);

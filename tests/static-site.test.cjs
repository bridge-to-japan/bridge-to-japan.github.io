const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "site");
const htmlFiles = fs.readdirSync(site).filter((name) => name.endsWith(".html"));

function read(file) { return fs.readFileSync(path.join(site, file), "utf8"); }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function attributes(html, name) {
  const values = [];
  const expression = new RegExp(`\\b${name}=["']([^"']+)["']`, "gi");
  let match;
  while ((match = expression.exec(html))) values.push(match[1]);
  return values;
}

test("HTML documents have unique IDs and their local files exist", () => {
  assert.ok(htmlFiles.length >= 5);
  for (const file of htmlFiles) {
    const html = read(file);
    const ids = attributes(html, "id");
    assert.equal(new Set(ids).size, ids.length, `${file} contains a duplicate id`);

    for (const reference of [...attributes(html, "src"), ...attributes(html, "href"), ...attributes(html, "poster")]) {
      if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(reference)) continue;
      const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
      if (!clean) continue;
      assert.ok(fs.existsSync(path.resolve(site, clean)), `${file} points to missing ${clean}`);
    }
  }
});

test("local fragment links resolve to IDs in the target document", () => {
  for (const file of htmlFiles) {
    const html = read(file);
    for (const href of attributes(html, "href")) {
      if (!href.includes("#") || /^(?:https?:|mailto:|tel:)/i.test(href)) continue;
      const [targetFile, fragment] = href.split("#");
      if (!fragment) continue;
      const resolvedFile = targetFile || file;
      if (!resolvedFile.endsWith(".html")) continue;
      const targetHtml = read(resolvedFile);
      assert.match(targetHtml, new RegExp(`\\bid=["']${fragment.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}["']`), `${href} from ${file} is unresolved`);
    }
  }
});

test("landing page exposes the complete FAQ and Google consultation contract", () => {
  const html = read("index.html");
  const resourcesHtml = read("resources.html");
  const mainJs = fs.readFileSync(path.join(site, "assets", "js", "main.js"), "utf8");
  const styles = fs.readFileSync(path.join(site, "assets", "css", "styles.css"), "utf8");
  assert.equal((html.match(/<details class="faq-item"/g) || []).length, 18);
  assert.match(html, /data-endpoint="(?:YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL|https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec)"/);
  assert.match(html, /data-recaptcha-sitekey="(?:YOUR_GOOGLE_RECAPTCHA_SITE_KEY|[A-Za-z0-9_-]{20,})"/);
  assert.match(html, /data-mode="auto"/);
  assert.match(html, /data-live-hosts="bridge-to-japan\.github\.io"/);
  assert.match(html, /data-privacy-policy-version="2026-08-24"/);
  assert.match(html, /class="preview-banner" data-preview-banner hidden/);
  assert.match(mainJs, /previewBanner\.hidden = !isPreview/);
  assert.match(styles, /\.preview-banner\[hidden\]\s*\{[^}]*display:\s*none\s*!important;/);
  assert.match(mainJs, /isTrustedAppsScriptMessageOrigin/);
  assert.match(mainJs, /-script\\\.googleusercontent\\\.com/);
  assert.doesNotMatch(mainJs, /event\.source !== frame\.contentWindow/);
  assert.match(html, /BRIDGE TO JAPAN/);
  assert.match(html, /Dana Yoon/);
  assert.match(html, /Victor Alex Holden Jean/);
  assert.match(html, /빅터 알렉스 홀든 진/);
  assert.match(html, /Business Development Representative – Europe/);
  assert.match(html, /<div class="role-grid reveal-group" id="contact">/);
  assert.doesNotMatch(html, /class="about-contact\b/);
  const danaCard = html.match(/<article class="role-card role-card--support reveal">[\s\S]*?<\/article>/)?.[0] || "";
  const tYoonCard = html.match(/<article class="role-card role-card--provider reveal">[\s\S]*?<\/article>/)?.[0] || "";
  const victorCard = html.match(/<article class="role-card role-card--representative reveal">[\s\S]*?<\/article>/)?.[0] || "";
  assert.match(danaCard, /Dana Yoon/);
  assert.doesNotMatch(danaCard, /<a\b|href=/);
  assert.match(tYoonCard, /href="mailto:tj@smartstartjapan\.com"/);
  assert.match(tYoonCard, /href="https:\/\/www\.linkedin\.com\/in\/t-y-351301309\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="T\.Yoon LinkedIn 프로필, 새 창"/);
  assert.match(victorCard, /href="mailto:victor\.jean@europe2japan\.org"/);
  assert.equal((html.match(/href="mailto:tj@smartstartjapan\.com"/g) || []).length, 1);
  assert.equal((html.match(/href="mailto:victor\.jean@europe2japan\.org"/g) || []).length, 1);
  assert.doesNotMatch([html, resourcesHtml, mainJs].join("\n"), /deep zone inc\./i);
  assert.match(read("commercial-policy.html"), /deep zone inc\./i);
  assert.match(html, /assets\/images\/brand\/deep-zone-logo\.jpg/);
  assert.equal((html.match(/assets\/images\/people\/t-yoon\.jpg/g) || []).length, 2);
  assert.equal((html.match(/<article class="role-card/g) || []).length, 3);
  assert.match(html, /role-card__initial--support[\s\S]*?<svg/);
  assert.match(html, /assets\/images\/people\/victor-jean\.webp[^>]*alt="Victor Alex Holden Jean 프로필 사진"/);
  assert.doesNotMatch(html, /provider-disclosure/);
  assert.match(mainJs, /bridge-to-japan-contact-v1/);
  assert.doesNotMatch(html, /Turnstile|Resend|data-turnstile/i);
  const withoutTestSlug = html
    .replaceAll("smartstartjapan-ko", "test-repository")
    .replaceAll("tj@smartstartjapan.com", "approved-contact@example.invalid");
  assert.doesNotMatch(withoutTestSlug, /Smart(?:Start|Boost|Bank|Growth)|Tyson|Teh-Jin/i);
});

test("production SEO uses the root GitHub Pages origin and permits indexing", () => {
  const productionOrigin = "https://bridge-to-japan.github.io";
  const legacyOrigin = /https:\/\/lukapee-lab\.github\.io\/smartstartjapan-ko/i;
  const indexedPages = new Map([
    ["index.html", `${productionOrigin}/`],
    ["resources.html", `${productionOrigin}/resources.html`],
    ["privacy.html", `${productionOrigin}/privacy.html`],
    ["commercial-policy.html", `${productionOrigin}/commercial-policy.html`],
    ["copyright-policy.html", `${productionOrigin}/copyright-policy.html`]
  ]);

  for (const [file, url] of indexedPages) {
    const html = read(file);
    const escapedUrl = escapeRegExp(url);
    assert.match(html, /<meta name="robots" content="index,follow">/, `${file} must be indexable`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${escapedUrl}">`));
    assert.match(html, new RegExp(`<link rel="alternate" hreflang="ko" href="${escapedUrl}">`));
    assert.match(html, new RegExp(`<meta property="og:url" content="${escapedUrl}">`));
    assert.match(html, new RegExp(`<meta property="og:image" content="${escapeRegExp(`${productionOrigin}/assets/images/brand/deep-zone-logo.jpg`)}">`));
    assert.match(html, new RegExp(`<meta name="twitter:image" content="${escapeRegExp(`${productionOrigin}/assets/images/brand/deep-zone-logo.jpg`)}">`));
    assert.doesNotMatch(html, legacyOrigin);
  }

  const mainJs = fs.readFileSync(path.join(site, "assets", "js", "main.js"), "utf8");
  assert.match(mainJs, /https:\/\/bridge-to-japan\.github\.io\/#service/);
  assert.match(mainJs, /https:\/\/bridge-to-japan\.github\.io\/#faq/);
  assert.match(mainJs, /form\.dataset\.liveHosts \|\| "bridge-to-japan\.github\.io"/);
  assert.doesNotMatch(mainJs, legacyOrigin);

  const robots = fs.readFileSync(path.join(site, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*\r?\nAllow: \/$/m);
  assert.doesNotMatch(robots, /^Disallow:/m);
  assert.match(robots, new RegExp(`^Sitemap: ${escapeRegExp(`${productionOrigin}/sitemap.xml`)}$`, "m"));

  const sitemap = fs.readFileSync(path.join(site, "sitemap.xml"), "utf8");
  const sitemapUrls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  assert.deepEqual(sitemapUrls, Array.from(indexedPages.values()));
  assert.equal((sitemap.match(/<lastmod>2026-08-24<\/lastmod>/g) || []).length, indexedPages.size);
  assert.doesNotMatch(sitemap, legacyOrigin);

  const notFound = read("404.html");
  assert.match(notFound, /<meta name="robots" content="noindex,nofollow,noarchive">/);
  assert.doesNotMatch(notFound, /<meta name="robots" content="index,follow">/);
});

test("customer stories use two accessible, on-demand local videos", () => {
  const html = read("index.html");
  const mainJs = fs.readFileSync(path.join(site, "assets", "js", "main.js"), "utf8");
  const styles = fs.readFileSync(path.join(site, "assets", "css", "styles.css"), "utf8");
  const videos = html.match(/<video\b[\s\S]*?<\/video>/g) || [];
  assert.equal(videos.length, 2);
  assert.equal((html.match(/class="video-review-card reveal"/g) || []).length, 2);
  assert.match(html, /id="reviews"/);
  assert.match(html, /assets\/videos\/customer-review-01\.mp4/);
  assert.match(html, /assets\/videos\/customer-review-02\.mp4/);
  assert.match(html, /assets\/images\/reviews\/customer-review-01-poster\.webp/);
  assert.match(html, /assets\/images\/reviews\/customer-review-02-poster\.webp/);
  for (const video of videos) {
    assert.match(video, /\bcontrols\b/);
    assert.match(video, /\bplaysinline\b/);
    assert.match(video, /\bpreload="metadata"/);
    assert.match(video, /\baria-label="[^"]+"/);
    assert.match(video, /\baria-describedby="review-0[12]-summary"/);
    assert.doesNotMatch(video, /\b(?:autoplay|loop)\b/);
    assert.doesNotMatch(video, /https?:\/\//);
    const captionTracks = video.match(/<track\b[^>]*kind="captions"[^>]*>/g) || [];
    assert.equal(captionTracks.length, 2);
    assert.equal(captionTracks.filter((track) => /\bdefault\b/.test(track)).length, 1);
    assert.ok(captionTracks.some((track) => /\bsrclang="ko"/.test(track)));
  }
  assert.match(videos[0], /\bsrclang="es"/);
  assert.match(videos[1], /\bsrclang="en"/);
  assert.match(mainJs, /customerReviewVideos/);
  assert.match(mainJs, /otherVideo\.pause\(\)/);
  assert.match(mainJs, /\.\.\.customerReviewVideos/);
  assert.match(styles, /\.video-review-card video\s*\{[^}]*object-fit:\s*cover;/);
  assert.doesNotMatch(styles, /\.video-review-card video\s*\{[^}]*object-fit:\s*contain;/);
});

test("customer video captions are local, timed WebVTT files", () => {
  const captionDirectory = path.join(site, "assets", "captions");
  const captionFiles = fs.readdirSync(captionDirectory).filter((name) => name.endsWith(".vtt")).sort();
  assert.deepEqual(captionFiles, [
    "customer-review-01-es.vtt",
    "customer-review-01-ko.vtt",
    "customer-review-02-en.vtt",
    "customer-review-02-ko.vtt"
  ]);
  for (const file of captionFiles) {
    const captions = fs.readFileSync(path.join(captionDirectory, file), "utf8");
    assert.match(captions, /^WEBVTT\r?\n/);
    assert.ok((captions.match(/\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}/g) || []).length >= 4);
    assert.doesNotMatch(captions, /Smart(?:Start|Japan|Korea)/i);
  }
});

test("public source contains no retired brand or people references", () => {
  const captionDirectory = path.join(site, "assets", "captions");
  const captionSource = fs.readdirSync(captionDirectory)
    .filter((name) => name.endsWith(".vtt"))
    .map((name) => fs.readFileSync(path.join(captionDirectory, name), "utf8"));
  const publicSource = [
    ...htmlFiles.map((file) => read(file)),
    fs.readFileSync(path.join(site, "assets", "js", "main.js"), "utf8"),
    ...captionSource
  ].join("\n")
    .replaceAll("smartstartjapan-ko", "test-repository")
    .replaceAll("tj@smartstartjapan.com", "approved-contact@example.invalid");
  assert.doesNotMatch(publicSource, /Smart(?:Start|Boost|Bank|Growth)|Tyson|Teh-Jin|Scaling Your Company/i);
});

test("privacy notice documents Sheets storage, reCAPTCHA and one-year retention", () => {
  const html = read("privacy.html");
  assert.match(html, /Google Apps Script/);
  assert.match(html, /Google Sheets/);
  assert.match(html, /reCAPTCHA/);
  assert.match(html, /상담 종료일로부터 1년/);
  assert.doesNotMatch(html, /Cloudflare Worker|Turnstile|Resend/);
});

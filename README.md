# Japan Budget Trip

Static first version for japanbudgettrip.com.

## Deploy

Recommended free setup:

1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, create a new project from that repository.
3. Use no build command and `/` as the output directory.
4. Add the custom domains `japanbudgettrip.com` and `www.japanbudgettrip.com`.

No VPS or traditional server is required for this version.

## Maintenance

Run these checks before pushing larger content changes:

```sh
node scripts/generate-feed.js
node scripts/generate-llms.js
node scripts/site-check.js
node --check script.js
xmllint --noout sitemap.xml
xmllint --noout feed.xml
```

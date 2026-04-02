# Official Website

This directory contains a static marketing site for X Thread Reader.

## Deploy on Vercel

The simplest setup is:

1. Import this repository into Vercel.
2. Set **Root Directory** to `site`.
3. Use the default static site deployment.
4. After your production domain is known, replace every occurrence of `https://x-thread-reader.vercel.app` in this directory with your real URL.
5. Submit `https://YOUR-DOMAIN/sitemap.xml` to Google Search Console and Bing Webmaster Tools.

## Local preview

From the repo root:

```bash
python3 -m http.server 4321 --directory site
```

Then open `http://localhost:4321`.

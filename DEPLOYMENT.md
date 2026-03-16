# Deployment notes (codesandbox-light-site)

## What’s deployed
- **Production build output** is in `dist/` (static files).
- The site is **multi-page** (`index.html`, `pricing.html`, `services.html`, `work.html`, `about.html`, `contact.html`).

## Deploy options
### Option A — AnyGen Share (fastest)
- Open the preview and click **Share** to publish a shareable link.

### Option B — Netlify / Vercel / Cloudflare Pages (static)
Upload the `dist/` folder or connect the repo and use:
- **Build command:** `pnpm install && pnpm build`
- **Output directory:** `dist`

## Local dev
- `pnpm install`
- `pnpm dev`

## Where the imported CodeSandbox files live
- Static assets/pages were imported into `public/`.
- The Vite entry page is the root `index.html`.

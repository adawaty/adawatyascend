import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';

const outDir = '/home/user/workspace/website/codesandbox-light-site/public/assets/clients';
await fs.mkdir(outDir, { recursive: true });

const targets = [
  { slug: 'meteory', url: 'https://meteory-eg.com/' },
  { slug: 'sparx', url: 'https://sparxeng.com/' },
  { slug: 'altawfeek', url: 'https://altawfeekengineering.com/' },
  { slug: 'dnc-clinic', url: 'https://drhanin.com/' },
  { slug: 'tawplast', url: 'https://tawplast.com/' },
  { slug: 'egyspring', url: 'https://egyspring.com/' },
  { slug: 'aithub', url: 'https://aithub-eg.com/' },
  { slug: 'hostocta', url: 'https://hostocta.com/' },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  deviceScaleFactor: 1,
  locale: 'en-US',
});

for (const t of targets) {
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded' });
    // allow late fonts/hero media
    await page.waitForTimeout(2500);
    // try to accept common cookie banners
    await page.evaluate(() => {
      const texts = ['accept', 'agree', 'allow all', 'i agree', 'got it'];
      const btns = Array.from(document.querySelectorAll('button, a'))
        .filter(el => {
          const s = (el.textContent || '').trim().toLowerCase();
          return texts.some(x => s === x || s.includes(x));
        })
        .slice(0, 2);
      btns.forEach(b => (b instanceof HTMLElement) && b.click());
    });
    await page.waitForTimeout(800);

    const outPng = path.join(outDir, `${t.slug}.png`);
    await page.screenshot({ path: outPng, fullPage: false });
    console.log('OK', t.slug);
  } catch (e) {
    console.log('FAIL', t.slug, String(e).slice(0, 220));
  } finally {
    await page.close();
  }
}

await context.close();
await browser.close();

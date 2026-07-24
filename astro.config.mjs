// @ts-check
import { defineConfig } from 'astro/config';

// Minimal static site. White background, black text, Helvetica Neue.
// Two deploy targets:
//  - `npm run deploy` sets GH_PAGES=1 -> GitHub Pages under /builtbyelisa
//  - plain `astro build` (e.g. Vercel) -> served at the domain root
const ghPages = process.env.GH_PAGES === '1';

export default defineConfig({
  site: ghPages ? 'https://theelinumbriel.github.io' : 'https://builtbyelisa.vercel.app',
  base: ghPages ? '/builtbyelisa' : undefined,
});

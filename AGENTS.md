# Agent notes

- Verify: `npx tsc --noEmit` then `npx next build` (all routes must prerender as static).
- Do NOT set `output: "export"` in next.config — Next 16 static export emits RSC segment files that 404 on
  client prefetch with plain static hosts. Deploy natively on Vercel instead.
- Brand colors: navy `#14213D`, cream `#F4EDE0`, coral `#FF6B58` (Tailwind tokens in `app/globals.css`).
- lucide-react in this version has no brand icons (Linkedin/Github) — don't import them.
- Synthetic data is seeded (`lib/data/common.ts` `rng`) so SSR and client render identical output; never use
  `Math.random()`/`Date.now()` in data or render paths.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { get, put } from '@vercel/blob';

const COOKIE_NAME = 'elisadiopweyer_handwriting_session';
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_SVG_BYTES = 750_000;
const MANIFEST_PATH = 'handwriting/manifest.json';
const SLOTS = new Set([
  'elisa-diop-weyer',
  'portfolio',
  'about',
  'contact',
]);

const json = (value, status = 200, headers = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });

const password = () => process.env.HANDWRITING_PASSWORD || '';

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
};

const sign = (expiresAt) =>
  createHmac('sha256', password())
    .update(`handwriting-session:${expiresAt}`)
    .digest('base64url');

const cookieValue = (request) => {
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE_NAME) return rest.join('=');
  }
  return '';
};

const isAuthenticated = (request) => {
  if (!password()) return false;
  const [expiresText, signature] = cookieValue(request).split('.');
  const expiresAt = Number(expiresText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || !signature) return false;
  return safeEqual(signature, sign(expiresAt));
};

const sessionCookie = () => {
  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  return `${COOKIE_NAME}=${expiresAt}.${sign(expiresAt)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
};

const clearSessionCookie = () =>
  `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

const isSameOrigin = (request) => {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
};

const readManifest = async () => {
  try {
    const result = await get(MANIFEST_PATH, { access: 'private' });
    if (!result || result.statusCode !== 200 || !result.stream) return { version: 1, slots: {} };
    const parsed = await new Response(result.stream).json();
    if (!parsed || parsed.version !== 1 || typeof parsed.slots !== 'object') {
      return { version: 1, slots: {} };
    }
    return parsed;
  } catch {
    return { version: 1, slots: {} };
  }
};

const localFallback = (request, slot) =>
  new Response(null, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store',
      Location: new URL(`/handwriting/${slot}.svg`, request.url).toString(),
    },
  });

const validateSvg = (source) => {
  const svg = source.replace(/^\uFEFF/, '').trim();
  if (!/^<\?xml[\s\S]*?\?>\s*<svg\b/i.test(svg) && !/^<svg\b/i.test(svg)) {
    return { error: 'The file must contain a complete SVG document.' };
  }
  if (!/<\/svg>\s*$/i.test(svg)) {
    return { error: 'The SVG closing tag is missing.' };
  }
  if (!/\bviewBox\s*=\s*(["'])[^"']+\1/i.test(svg)) {
    return { error: 'The SVG needs a viewBox so it scales correctly.' };
  }
  if (!/<(?:path|line|polyline|polygon|rect|circle|ellipse)\b/i.test(svg)) {
    return { error: 'The SVG does not contain any visible vector paths or shapes.' };
  }

  const forbidden = [
    /<!DOCTYPE\b/i,
    /<!ENTITY\b/i,
    /<script\b/i,
    /<foreignObject\b/i,
    /<(?:iframe|object|embed|audio|video|image)\b/i,
    /<style\b/i,
    /\son[a-z]+\s*=/i,
    /\b(?:href|xlink:href)\s*=\s*(["'])\s*(?:javascript:|data:|https?:|\/\/)/i,
    /\burl\s*\(\s*(["']?)\s*(?:javascript:|data:|https?:|\/\/)/i,
    /@import\b/i,
    /expression\s*\(/i,
  ];
  if (forbidden.some((pattern) => pattern.test(svg))) {
    return { error: 'For safety, SVGs may contain vector shapes only—no scripts, embedded media, events, or remote resources.' };
  }

  // Handwriting is always rendered as black ink. Preserve explicit `none` fills
  // and strokes, but normalize every other color at the storage boundary.
  const normalized = svg
    .replace(/\bfill\s*=\s*(["'])(?!none\1)[^"']*\1/gi, 'fill="#000000"')
    .replace(/\bstroke\s*=\s*(["'])(?!none\1)[^"']*\1/gi, 'stroke="#000000"');

  return { svg: normalized };
};

export async function GET(request) {
  const url = new URL(request.url);

  if (url.searchParams.get('action') === 'status') {
    const authenticated = isAuthenticated(request);
    const manifest = authenticated ? await readManifest() : { slots: {} };
    const slots = Object.fromEntries(
      [...SLOTS].map((slot) => {
        const entry = manifest.slots?.[slot];
        return [slot, entry ? { uploadedAt: entry.uploadedAt, originalName: entry.originalName } : null];
      }),
    );
    return json({ authenticated, slots });
  }

  const slot = url.searchParams.get('slot') || '';
  if (!SLOTS.has(slot)) return json({ error: 'Unknown handwriting slot.' }, 404);

  const manifest = await readManifest();
  const entry = manifest.slots?.[slot];
  if (!entry?.pathname) return localFallback(request, slot);

  try {
    const result = await get(entry.pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') || undefined,
    });
    if (result?.statusCode === 304) {
      return new Response(null, { status: 304, headers: { ETag: result.blob.etag } });
    }
    if (!result || result.statusCode !== 200 || !result.stream) return localFallback(request, slot);

    return new Response(result.stream, {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Content-Disposition': `inline; filename="${slot}.svg"`,
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'Content-Type': 'image/svg+xml; charset=utf-8',
        ETag: result.blob.etag,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return localFallback(request, slot);
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return json({ error: 'Cross-origin requests are not allowed.' }, 403);
  if (!password()) return json({ error: 'Handwriting administration is not configured.' }, 503);

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request.' }, 400);
    }

    if (body.action === 'login') {
      if (!safeEqual(body.password || '', password())) {
        return json({ error: 'Incorrect password.' }, 401);
      }
      return json(
        { ok: true },
        200,
        { 'Set-Cookie': sessionCookie() },
      );
    }

    if (body.action === 'logout') {
      return json(
        { ok: true },
        200,
        { 'Set-Cookie': clearSessionCookie() },
      );
    }

    return json({ error: 'Unknown action.' }, 400);
  }

  if (!isAuthenticated(request)) return json({ error: 'Please sign in again.' }, 401);
  if (!contentType.includes('multipart/form-data')) return json({ error: 'Expected an SVG upload.' }, 415);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'The upload could not be read.' }, 400);
  }

  const slot = String(form.get('slot') || '');
  const file = form.get('file');
  if (!SLOTS.has(slot)) return json({ error: 'Unknown handwriting slot.' }, 400);
  if (!(file instanceof File)) return json({ error: 'Choose an SVG file first.' }, 400);
  if (file.size === 0 || file.size > MAX_SVG_BYTES) {
    return json({ error: 'SVGs must be smaller than 750 KB.' }, 413);
  }
  if (!file.name.toLowerCase().endsWith('.svg')) {
    return json({ error: 'Only .svg files are accepted.' }, 415);
  }

  let source;
  try {
    source = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    return json({ error: 'The SVG must be UTF-8 text.' }, 415);
  }

  const checked = validateSvg(source);
  if (checked.error) return json({ error: checked.error }, 422);

  const uploadedAt = new Date().toISOString();
  const pathname = `handwriting/${slot}/${Date.now()}.svg`;

  try {
    await put(pathname, checked.svg, {
      access: 'private',
      addRandomSuffix: false,
      cacheControlMaxAge: 31_536_000,
      contentType: 'image/svg+xml',
    });

    const manifest = await readManifest();
    manifest.version = 1;
    manifest.updatedAt = uploadedAt;
    manifest.slots = manifest.slots || {};
    manifest.slots[slot] = {
      pathname,
      uploadedAt,
      originalName: file.name.slice(0, 180),
      size: new TextEncoder().encode(checked.svg).byteLength,
    };

    await put(MANIFEST_PATH, JSON.stringify(manifest), {
      access: 'private',
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: 'application/json',
    });

    return json({ ok: true, slot, uploadedAt });
  } catch (error) {
    console.error('Handwriting upload failed', error);
    return json({ error: 'The SVG could not be saved. Please try again.' }, 500);
  }
}


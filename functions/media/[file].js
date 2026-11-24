const clips = {
  "ym-001.mp4": { name: "YM视频.mp4", sizes: [2700000, 2603871] },
  "yx-002.mp4": { name: "YX视频.mp4", sizes: [2700000, 2700000, 2582362] },
  "yx-003.mp4": { name: "YX视频2.mp4", sizes: [2700000, 1466463] },
  "yx-005.mp4": { name: "视频2026-11-19_213352_750.mp4", sizes: [2700000, 1016143] }
};

function readRange(value, size) {
  if (!value) return { start: 0, end: size - 1, status: 200 };
  const match = /^bytes=(\d*)-(\d*)$/i.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (!Number.isSafeInteger(start) || start >= size || start > end) return null;
  }
  return { start, end, status: 206 };
}

export async function onRequest({ request, params, env, next }) {
  const clip = Object.hasOwn(clips, params.file) ? clips[params.file] : null;
  if (!clip) return next();
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const size = clip.sizes.reduce((total, part) => total + part, 0);
  const range = readRange(request.method === "GET" ? request.headers.get("Range") : null, size);
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Content-Type": "video/mp4",
    "Cache-Control": "public, max-age=86400"
  });
  if (!range) {
    headers.set("Content-Range", "bytes */" + size);
    return new Response(null, { status: 416, headers });
  }

  const { start, end, status } = range;
  const length = end - start + 1;
  headers.set("Content-Length", String(length));
  if (status === 206) headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  if (request.method === "HEAD") return new Response(null, { status, headers });

  const output = new Uint8Array(length);
  let offset = 0;
  for (const [index, partSize] of clip.sizes.entries()) {
    const partStart = offset;
    offset += partSize;
    if (offset <= start || partStart > end) continue;

    const url = new URL("/media/chunks/" + encodeURIComponent(clip.name) + ".part" + index, request.url);
    const response = await env.ASSETS.fetch(new Request(url));
    if (!response.ok) return new Response("Archive video unavailable", { status: 502 });
    const part = new Uint8Array(await response.arrayBuffer());
    if (part.byteLength !== partSize) return new Response("Archive video incomplete", { status: 502 });

    const from = Math.max(start, partStart);
    const to = Math.min(end + 1, offset);
    output.set(part.subarray(from - partStart, to - partStart), from - start);
  }
  return new Response(output, { status, headers });
}

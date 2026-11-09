/* Optimasi gambar unggahan: JPG/PNG/GIF otomatis diubah ke WebP dan
   dikecilkan agar slider ringan. `sharp` dimuat dinamis supaya server tetap
   jalan (memakai berkas asli) bila paket native itu belum tersedia. */
const MAX_SIDE = 2000;
const WEBP_QUALITY = 82;

let sharpPromise = null;
function loadSharp() {
  if (!sharpPromise) {
    sharpPromise = import("sharp")
      .then((m) => m.default || m)
      .catch(() => null);
  }
  return sharpPromise;
}

export async function optimizeImage(buffer, mime) {
  if (!buffer || !buffer.length) return { buffer, mime, ext: extFor(mime) };
  if (mime === "image/webp") return { buffer, mime, ext: ".webp" };

  const sharp = await loadSharp();
  if (!sharp) return { buffer, mime, ext: extFor(mime) };

  try {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();
    if (!out || !out.length) return { buffer, mime, ext: extFor(mime) };
    return { buffer: out, mime: "image/webp", ext: ".webp" };
  } catch {
    return { buffer, mime, ext: extFor(mime) };
  }
}

export function extFor(mime) {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".jpg";
}

import { z } from "zod";

export const KlassSchema = z.enum(["X", "XI", "XII"]);

const HTTP_LINK = /^https?:\/\/[^\s"'<>]+$/i;
const LOCAL_LINK = /^\/?(?!\/)[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*\.html?(?:[?#][^\s"'<>]*)?$/i;

/* Terima URL http(s) atau halaman di situs ini. Tolak skema berbahaya
   (javascript:, data:), protocol-relative, backslash, traversal, dan kutip
   yang bisa merusak atribut HTML. */
export function isSafeFileLink(value) {
  if (typeof value !== "string") return false;
  if (HTTP_LINK.test(value)) return true;
  if (!value || value.startsWith("//") || value.includes("..") || value.includes("\\")) return false;
  return LOCAL_LINK.test(value);
}

export const EntrySchema = z.object({
  id: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/).optional(),
  klass: KlassSchema,
  name: z.string().trim().min(1).max(120),
  short: z.string().trim().max(120).transform((v) => v.slice(0, 40)).optional(),
  teacher: z.string().trim().max(80).nullish(),
  icon: z.string().trim().max(40).regex(/^[a-z0-9_-]+$/i),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  file: z.string().trim().min(1).max(500).refine(isSafeFileLink, "invalid_link"),
  pub: z.boolean().optional(),
  scriptId: z.string().trim().max(200).nullish(),
});

/* Query ?klass= harus string kelas yang dikenal, bukan object/array. */
export function parseKlass(value) {
  if (value === undefined) return { ok: true, value: undefined };
  const parsed = KlassSchema.safeParse(value);
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
}

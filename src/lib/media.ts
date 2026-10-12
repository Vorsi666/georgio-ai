import type { ChatAttachment } from "./agui-client";
import { rid } from "./agui-client";

/** Batas lampiran per pesan — dijaga kecil supaya localStorage tidak jebol. */
export const MAX_MEDIA_FILES = 4;
export const MAX_MEDIA_MB = 10;
const MAX_BYTES = MAX_MEDIA_MB * 1024 * 1024;

export function mediaKindOf(mime: string): ChatAttachment["kind"] | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function readOne(file: File): Promise<ChatAttachment | string> {
  const kind = mediaKindOf(file.type);
  if (!kind) return Promise.resolve(`"${file.name}" bukan foto/video.`);
  if (file.size === 0) return Promise.resolve(`"${file.name}" kosong.`);
  if (file.size > MAX_BYTES)
    return Promise.resolve(`"${file.name}" kebesaran (${formatBytes(file.size)} > ${MAX_MEDIA_MB} MB).`);
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onerror = () => resolve(`"${file.name}" gagal dibaca.`);
    fr.onload = () => {
      if (typeof fr.result !== "string") {
        resolve(`"${file.name}" gagal dibaca.`);
        return;
      }
      resolve({ id: rid(), kind, name: file.name, mime: file.type, size: file.size, dataUrl: fr.result });
    };
    fr.readAsDataURL(file);
  });
}

export async function filesToAttachments(
  input: FileList | File[],
  already: number,
): Promise<{ added: ChatAttachment[]; rejected: string[] }> {
  const all = Array.from(input);
  const room = Math.max(0, MAX_MEDIA_FILES - already);
  const rejected: string[] = all.length > room ? [`Maksimal ${MAX_MEDIA_FILES} lampiran per pesan.`] : [];
  const added: ChatAttachment[] = [];
  for (const f of all.slice(0, room)) {
    const r = await readOne(f);
    if (typeof r === "string") rejected.push(r);
    else added.push(r);
  }
  return { added, rejected };
}

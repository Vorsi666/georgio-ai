/**
 * Floating quick-prompt dock — ported from `desain Georgio agent/chat.html`
 * ("Floating Dock Container for Quick Suggestions & Prompt Box").
 * Suggestions are mode-aware; clicking one fills the composer instead of
 * silently sending, so the user keeps control of the final message.
 */
import { BentoTrends, ColorPalette, ComponentSandbox, FeedbackRow } from "./RichAnswer";

export const SUGGESTIONS: Record<string, { label: string; text: string }[]> = {
  tanya: [
    { label: "Analisis Tren Visual UI 2025", text: "Buat analisis tren visual UI design tahun 2025 dan berikan rekomendasi palet warna modern serta struktur antarmuka untuk produk SaaS." },
    { label: "Audit Keamanan Database", text: "Audit keamanan database saya: apa saja celah yang perlu diperketat agar tidak ada kebocoran data antar pengguna?" },
    { label: "Optimasi Prompt System", text: "Optimasi prompt system untuk memangkas latensi token model tanpa kehilangan konteks penting." },
    { label: "Prototype Komponen Button", text: "Buat prototype komponen Button interactive dengan kinetic feedback menggunakan Tailwind dan Material 3." },
  ],
  ringkas: [
    { label: "Ringkas Artikel", text: "Tempel artikel atau catatan panjang di sini untuk diringkas." },
    { label: "Ringkas Meeting Notes", text: "Ringkas meeting notes ini menjadi 3 keputusan utama dan 5 action item." },
    { label: "Ringkas Kode Panjang", text: "Ringkas kode ini dan jelaskan apa yang dilakukan setiap bagian." },
  ],
  ide: [
    { label: "Ide Konten 7 Hari", text: "Buat ide konten 7 hari untuk akun yang membahas desain dan teknologi Indonesia." },
    { label: "Ide Nama Produk", text: "Beri 10 ide nama produk untuk aplikasi AI lokal, dengan alasan singkat tiap nama." },
    { label: "Ide Side Hustle", text: "Berikan 5 ide side hustle yang bisa dijalankan modal kecil dari rumah." },
  ],
};

export function QuickSuggestions({
  mode,
  onPick,
}: {
  mode: string;
  onPick: (text: string) => void;
}) {
  const items = SUGGESTIONS[mode] ?? SUGGESTIONS.tanya;
  return (
    <div className="flex gap-space-sm overflow-x-auto pb-space-xs -mx-space-md px-space-md">
      {items.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onPick(s.text)}
          className="flex-shrink-0 px-space-md py-1 rounded-full bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md shadow-sm transition-all"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export { BentoTrends, ColorPalette, ComponentSandbox, FeedbackRow };
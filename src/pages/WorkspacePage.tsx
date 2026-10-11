import type { PageId } from "../lib/pages";

/**
 * Generic workspace page shell for sections that are still structural.
 * Uses the exact card + typography language from the design so the app stays
 * visually consistent while each surface gets its real content.
 */
export default function WorkspacePage({
  id,
  title,
  subtitle,
  icon,
  badge,
  accent = "primary",
}: {
  id: PageId;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  accent?: "primary" | "secondary" | "tertiary";
}) {
  const iconWrap =
    accent === "tertiary"
      ? "bg-tertiary-fixed text-tertiary"
      : accent === "secondary"
        ? "bg-secondary-fixed text-primary"
        : "bg-primary-fixed text-primary";
  const labelColor =
    accent === "tertiary" ? "text-tertiary" : accent === "secondary" ? "text-secondary" : "text-primary";

  return (
    <div className="w-full flex flex-col gap-space-lg">
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconWrap}`}>
            <span className="material-symbols-outlined text-2xl leading-none">{icon}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">{title}</span>
              <span className={`font-label-sm text-label-sm ${labelColor}`}>*</span>
              {badge && (
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-primary text-on-primary font-medium tracking-wider">
                  {badge}
                </span>
              )}
            </div>
            <span className="font-label-md text-label-md text-outline">{subtitle}</span>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-start gap-space-md">
        <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md">
          <span>* {id.toUpperCase().replace(/-/g, " ")}</span>
          <span>—</span>
          <span className="text-on-surface-variant font-normal">Segmen sedang disiapkan</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
          Struktur halaman ini sudah mengikuti bahasa desain Georgio Agent. Konten modulnya menyusul —
          dan tidak akan menampilkan data apa pun sebelum sesi terautentikasi.
        </p>
      </section>
    </div>
  );
}
export default function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid-fade" aria-hidden="true" />
      <div className="container-wide relative py-20 sm:py-28">
        {eyebrow && <div className="chip mb-5">{eyebrow}</div>}
        <h1 className="font-display text-display-xl text-balance gradient-text max-w-4xl whitespace-pre-line">{title}</h1>
        {subtitle && <p className="mt-5 text-lg text-text-secondary max-w-2xl text-pretty">{subtitle}</p>}
      </div>
    </section>
  );
}

const ITEMS = [
  "claude-opus-4-8",
  "gpt-5.4",
  "gemini-3.7-flash",
  "vision · ocr",
  "video generation",
  "audio · voice",
  "3d · spatial",
  "embeddings",
  "agent tools",
  "nexora-auto",
];

export function Marquee() {
  return (
    <section aria-label="Supported models and modalities" className="relative overflow-hidden border-y border-white/5 py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {ITEMS.map((item) => (
              <span key={`${dup}-${item}`} className="flex items-center">
                <span className="mono px-6 text-[0.72rem] uppercase tracking-[0.24em] text-muted">
                  {item}
                </span>
                <span className="h-1 w-1 rotate-45 bg-cyan/50" aria-hidden />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
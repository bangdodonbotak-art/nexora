import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Reveal>
        <div
          className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
        >
          <span className="mono text-[0.7rem] tracking-[0.3em] text-cyan/80">{index}</span>
          <span className="h-px w-10 bg-gradient-to-r from-cyan/70 to-transparent" />
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="display mt-5 text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] text-mist">
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-muted md:text-[1.05rem]">
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
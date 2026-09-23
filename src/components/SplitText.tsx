import * as React from "react";
import { gsap } from "gsap";

type SplitType = "chars" | "words" | "lines";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitType;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

export function SplitText({
  text,
  className,
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "0px",
  textAlign = "left",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null);
  const unitsRef = React.useRef<HTMLSpanElement[]>([]);
  const hasAnimatedRef = React.useRef(false);
  unitsRef.current = [];

  const units = splitType === "words" ? text.split(/(\s+)/) : text.split("");

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || hasAnimatedRef.current) return;

    const targets = unitsRef.current;
    if (!targets.length) return;

    gsap.set(targets, from);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            gsap.fromTo(targets, from, {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              onComplete: onLetterAnimationComplete,
            });
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, splitType, delay, duration, ease, threshold, rootMargin]);

  return (
    <span ref={containerRef} className={className} style={{ display: "inline-block", textAlign }}>
      {units.map((unit, i) => {
        if (splitType === "words" && /^\s+$/.test(unit)) {
          return <React.Fragment key={i}>{unit}</React.Fragment>;
        }
        return (
          <span
            key={i}
            ref={(el) => {
              if (el) unitsRef.current.push(el);
            }}
            style={{ display: "inline-block", willChange: "transform, opacity" }}
          >
            {unit === " " ? " " : unit}
          </span>
        );
      })}
    </span>
  );
}

export default SplitText;

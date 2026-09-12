import * as React from "react";

interface GlareHoverProps {
  children: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function GlareHover({
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false,
  className,
  style,
}: GlareHoverProps) {
  const [hovering, setHovering] = React.useState(false);
  const hasPlayedRef = React.useRef(false);

  const handleEnter = () => {
    if (playOnce && hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    setHovering(true);
  };

  const handleLeave = () => {
    if (playOnce) return;
    setHovering(false);
  };

  const glareRgba = hexToRgba(glareColor, glareOpacity);

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "-50%",
          width: "200%",
          height: "100%",
          pointerEvents: "none",
          background: `linear-gradient(${glareAngle}deg, transparent calc(50% - ${glareSize / 2}px), ${glareRgba} 50%, transparent calc(50% + ${glareSize / 2}px))`,
          transform: hovering ? "translateX(100%)" : "translateX(-100%)",
          transition: `transform ${transitionDuration}ms ease-out`,
        }}
      />
    </div>
  );
}

export default GlareHover;

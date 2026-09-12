import * as React from "react";

type Direction = "up" | "down" | "left" | "right" | "diagonal";
type Shape = "square" | "hexagon" | "circle" | "triangle";

interface ShapeGridProps {
  speed?: number;
  squareSize?: number;
  direction?: Direction;
  borderColor?: string;
  hoverFillColor?: string;
  shape?: Shape;
  hoverTrailAmount?: number;
  size?: number;
  className?: string;
}

interface TrailEntry {
  col: number;
  row: number;
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  cx: number,
  cy: number,
  size: number
) {
  const r = size / 2;
  ctx.beginPath();
  switch (shape) {
    case "circle":
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;
    case "triangle":
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy + r);
      ctx.lineTo(cx - r, cy + r);
      ctx.closePath();
      break;
    case "hexagon":
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case "square":
    default:
      ctx.rect(cx - r, cy - r, size, size);
      break;
  }
}

export function ShapeGrid({
  speed = 0.25,
  squareSize = 40,
  direction = "diagonal",
  borderColor = "rgba(60, 50, 30, 0.08)",
  hoverFillColor = "rgba(26, 95, 63, 0.12)",
  shape = "square",
  hoverTrailAmount = 5,
  size = 28,
  className,
}: ShapeGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mouseRef = React.useRef<{ x: number; y: number } | null>(null);
  const trailRef = React.useRef<TrailEntry[]>([]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    let offsetX = 0;
    let offsetY = 0;
    let raf = 0;
    let lastHovered: TrailEntry | null = null;

    function step() {
      switch (direction) {
        case "up":
          offsetY -= speed;
          break;
        case "down":
          offsetY += speed;
          break;
        case "left":
          offsetX -= speed;
          break;
        case "right":
          offsetX += speed;
          break;
        case "diagonal":
        default:
          offsetX += speed;
          offsetY += speed;
          break;
      }

      const modX = ((offsetX % squareSize) + squareSize) % squareSize;
      const modY = ((offsetY % squareSize) + squareSize) % squareSize;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / squareSize) + 2;
      const rows = Math.ceil(height / squareSize) + 2;

      // Determine hovered cell (relative to scrolled grid) and update trail
      if (mouseRef.current) {
        const col = Math.floor((mouseRef.current.x + modX) / squareSize);
        const row = Math.floor((mouseRef.current.y + modY) / squareSize);
        if (!lastHovered || lastHovered.col !== col || lastHovered.row !== row) {
          lastHovered = { col, row };
          if (hoverTrailAmount > 0) {
            trailRef.current = [{ col, row }, ...trailRef.current].slice(0, hoverTrailAmount);
          } else {
            trailRef.current = [{ col, row }];
          }
        }
      }

      const trail = trailRef.current;

      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          const cx = i * squareSize - modX + squareSize / 2;
          const cy = j * squareSize - modY + squareSize / 2;

          const trailIdx = trail.findIndex((t) => t.col === i && t.row === j);
          if (trailIdx !== -1) {
            const alpha = 1 - trailIdx / Math.max(hoverTrailAmount, 1);
            ctx!.save();
            ctx!.globalAlpha = Math.max(alpha, 0.08);
            drawShape(ctx!, shape, cx, cy, Math.min(size, squareSize * 0.92));
            ctx!.fillStyle = hoverFillColor;
            ctx!.fill();
            ctx!.restore();
          }

          drawShape(ctx!, shape, cx, cy, Math.min(size, squareSize * 0.92));
          ctx!.strokeStyle = borderColor;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }

      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [speed, squareSize, direction, borderColor, hoverFillColor, shape, hoverTrailAmount, size]);

  return <canvas ref={canvasRef} className={className} />;
}

export default ShapeGrid;

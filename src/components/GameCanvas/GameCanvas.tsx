import { useEffect, useRef } from 'react';

import { computeCanvasSize } from '@/engine/canvasSize';
import { useGameLoop } from '@/hooks/useGameLoop';

import styles from './GameCanvas.module.css';

// Bolinha de depuracao so para provar visualmente que update() roda a taxa
// fixa e render() interpola entre passos. Sera removida na Fase 2, quando
// entra a entidade Player de verdade.
interface DebugDot {
  x: number;
  prevX: number;
  speedPxPerMs: number;
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugDotRef = useRef<DebugDot>({ x: 0, prevX: 0, speedPxPerMs: 0.2 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const { width, height, styleWidth, styleHeight } = computeCanvasSize(
        container.clientWidth,
        container.clientHeight,
        window.devicePixelRatio,
      );

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${styleWidth}px`;
      canvas.style.height = `${styleHeight}px`;
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useGameLoop({
    update: (dt) => {
      const canvas = canvasRef.current;
      const dot = debugDotRef.current;
      if (!canvas) return;

      dot.prevX = dot.x;
      dot.x += dot.speedPxPerMs * dt;

      if (dot.x < 0 || dot.x > canvas.width) {
        dot.speedPxPerMs *= -1;
        dot.x = Math.min(Math.max(dot.x, 0), canvas.width);
      }
    },
    render: (alpha) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.fillStyle = '#12141c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dot = debugDotRef.current;
      const x = dot.prevX + (dot.x - dot.prevX) * alpha;
      const size = 40;
      ctx.fillStyle = '#5ee6c8';
      ctx.fillRect(x - size / 2, canvas.height / 2 - size / 2, size, size);
    },
  });

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

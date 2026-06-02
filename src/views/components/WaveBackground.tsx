import { useEffect, useRef, useState } from 'react';

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const animRef = useRef<number>(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let t = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const WAVE_COUNT = 8;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isHovering = mx >= 0 && my >= 0;

      // Fondo negro profundo
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < WAVE_COUNT; i++) {
        const progress = i / (WAVE_COUNT - 1); // 0..1
        const yBase = height * (0.25 + progress * 0.5);
        const amp = 38 + i * 6;
        const freq = 0.0018 + i * 0.0003;
        const speed = 0.004 + i * 0.0008;
        const phase = t * speed + i * 0.7;

        // Distancia del mouse a esta ola
        let glowFactor = 0;
        if (isHovering) {
          const dist = Math.abs(my - yBase);
          glowFactor = Math.max(0, 1 - dist / 160);
        }

        // Color base: gris antracita oscuro → amarillo dorado en hover
        const baseL = 14 + i * 2;
        const r = Math.round(baseL * 2.2 + glowFactor * 210);
        const g = Math.round(baseL * 2.2 + glowFactor * 165);
        const b = Math.round(baseL * 2.2 + glowFactor * 0);
        const alpha = 0.45 + i * 0.05 + glowFactor * 0.35;

        ctx.beginPath();
        ctx.moveTo(0, yBase);

        for (let x = 0; x <= width; x += 4) {
          // Efecto del mouse: la ola se eleva cerca del cursor
          let mouseWarp = 0;
          if (isHovering) {
            const dx = x - mx;
            mouseWarp = glowFactor * 22 * Math.exp(-dx * dx / (2 * 12000));
          }
          const y = yBase + Math.sin(x * freq + phase) * amp
                          + Math.sin(x * freq * 1.7 + phase * 0.6) * (amp * 0.4)
                          - mouseWarp;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 1.2 + glowFactor * 1.8;
        ctx.shadowColor = glowFactor > 0.1
          ? `rgba(212,170,0,${glowFactor * 0.6})`
          : 'transparent';
        ctx.shadowBlur = glowFactor * 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      t++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setHovered(true);
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1, y: -1 };
    setHovered(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 w-full h-full pointer-events-auto"
      style={{
        zIndex: 0,
        cursor: hovered ? 'crosshair' : 'default',
      }}
    />
  );
}

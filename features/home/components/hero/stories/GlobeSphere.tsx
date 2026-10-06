'use client';

import { useEffect, useRef } from 'react';

const POINTS = Array.from({ length: 560 }, (_, index) => {
  const y = 1 - (index / 559) * 2;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
});

export function GlobeSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let size = 0;
    let rotation = 0;
    let previousTime = 0;
    let accent = '#169f96';
    let background = '#fafafa';

    function updateColors() {
      const styles = getComputedStyle(document.documentElement);
      accent = styles.getPropertyValue('--theme-accent').trim() || accent;
      background = styles.getPropertyValue('--background').trim() || background;
    }

    function draw() {
      if (!context || size <= 0) return;
      context.clearRect(0, 0, size, size);

      const center = size / 2;
      const radius = size * 0.43;
      const shade = context.createRadialGradient(
        center - radius * 0.4, center - radius * 0.4, 0,
        center, center, radius,
      );
      shade.addColorStop(0, accent);
      shade.addColorStop(1, background);

      context.globalAlpha = 0.13;
      context.fillStyle = shade;
      context.beginPath();
      context.arc(center, center, radius, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;

      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);

      const projected = POINTS.map(point => {
        const x = point.x * cosine + point.z * sine;
        const z = point.z * cosine - point.x * sine;
        const perspective = 1 / (1 - z * 0.16);
        return {
          x: center + x * radius * perspective,
          y: center + point.y * radius * perspective,
          z,
          depth: (z + 1) / 2,
        };
      }).sort((a, b) => a.z - b.z);

      context.fillStyle = accent;
      for (const point of projected) {
        context.globalAlpha = 0.06 + point.depth * point.depth * 0.88;
        context.beginPath();
        context.arc(
          point.x, point.y,
          (0.55 + point.depth * 1.15) * size / 450,
          0, Math.PI * 2,
        );
        context.fill();
      }

      context.globalAlpha = 1;

      // A solid nucleus inside the rotating spherical shell.
      const coreRadius = size * 0.17;
      const nucleus = context.createRadialGradient(
        center - coreRadius * 0.45,
        center - coreRadius * 0.45,
        coreRadius * 0.03,
        center + coreRadius * 0.2,
        center + coreRadius * 0.25,
        coreRadius * 1.25,
      );
      nucleus.addColorStop(0, accent);
      nucleus.addColorStop(0.4, background);
      nucleus.addColorStop(1, background);

      context.save();
      context.shadowColor = accent;
      context.shadowBlur = size * 0.035;
      context.fillStyle = nucleus;
      context.beginPath();
      context.arc(center, center, coreRadius, 0, Math.PI * 2);
      context.fill();
      context.restore();

      // Rim light gives the nucleus a visible curved edge.
      context.strokeStyle = accent;
      context.lineWidth = Math.max(1, size / 450);
      context.globalAlpha = 0.55;
      context.beginPath();
      context.arc(center, center, coreRadius, Math.PI * 0.85, Math.PI * 1.8);
      context.stroke();

      // Tilted ring around the nucleus.
      context.globalAlpha = 0.3;
      context.beginPath();
      context.ellipse(
        center, center,
        size * 0.29, size * 0.095,
        -0.45, 0, Math.PI * 2,
      );
      context.stroke();

      // Current travelling along that ring.
      const angle = rotation * 3;
      const ringX = Math.cos(angle) * size * 0.29;
      const ringY = Math.sin(angle) * size * 0.095;
      const tilt = -0.45;

      context.globalAlpha = 1;
      context.fillStyle = accent;
      context.beginPath();
      context.arc(
        center + ringX * Math.cos(tilt) - ringY * Math.sin(tilt),
        center + ringX * Math.sin(tilt) + ringY * Math.cos(tilt),
        Math.max(2, size * 0.006),
        0, Math.PI * 2,
      );
      context.fill();
      context.globalAlpha = 1;
    }

    function tick(time: number) {
      const elapsed = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      rotation += elapsed * 0.00012;
      draw();
      frame = requestAnimationFrame(tick);
    }

    function restart() {
      cancelAnimationFrame(frame);
      previousTime = 0;
      draw();
      if (!motionQuery.matches && !document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    }

    function resize() {
      if (!canvas || !context) return;
      size = canvas.getBoundingClientRect().width;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }

    updateColors();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      updateColors();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    motionQuery.addEventListener('change', restart);
    document.addEventListener('visibilitychange', restart);
    resize();
    restart();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener('change', restart);
      document.removeEventListener('visibilitychange', restart);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 size-full"
    />
  );
}

'use client';

import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';

type Delivery = {
  city: string;
  location: [number, number];
  name: string;
  category: string;
  scope: string;
  bill: string;
};

export const deliveries: Delivery[] = [
  {
    city: 'Lagos',
    location: [6.52, 3.38],
    name: 'Service Booking Suite',
    category: 'Customer operations',
    scope: 'Bookings, client accounts and service requests',
    bill: '$2,400'
  },
  {
    city: 'London',
    location: [51.51, -0.13],
    name: 'Client Delivery Platform',
    category: 'Professional services',
    scope: 'Client portals, approvals and project records',
    bill: '$5,800'
  },
  {
    city: 'New York',
    location: [40.71, -74.01],
    name: 'Revenue Operations Console',
    category: 'Business intelligence',
    scope: 'Sales reporting, team access and two integrations',
    bill: '$6,500'
  },
  {
    city: 'Dubai',
    location: [25.2, 55.27],
    name: 'Commercial Quote Workspace',
    category: 'Sales operations',
    scope: 'Quote requests, approvals and customer records',
    bill: '$4,200'
  },
  {
    city: 'Singapore',
    location: [1.35, 103.82],
    name: 'Inventory & Order Control',
    category: 'Commerce operations',
    scope: 'Stock records, order workflows and supplier access',
    bill: '$5,200'
  },
  {
    city: 'Sydney',
    location: [-33.87, 151.21],
    name: 'Customer Support Hub',
    category: 'Customer service',
    scope: 'Support tickets, account history and team assignment',
    bill: '$4,600'
  },
  {
    city: 'Sao Paulo',
    location: [-23.55, -46.63],
    name: 'Supplier Collaboration Portal',
    category: 'Procurement',
    scope: 'Supplier accounts, document exchange and approvals',
    bill: '$3,800'
  }
];

type Vector = [number, number, number];

function vector([latitude, longitude]: [number, number]): Vector {
  const lat = latitude * Math.PI / 180;
  const lon = longitude * Math.PI / 180;
  return [
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon)
  ];
}

function arcPoint(from: Vector, to: Vector, progress: number): Vector {
  const middle = from.map((value, index) => value + to[index]);
  const length = Math.hypot(...middle);
  const control = middle.map(value => value / Math.max(length, 0.001));
  const remaining = 1 - progress;

  return from.map((value, index) =>
    remaining * remaining * value * 0.82 +
    2 * remaining * progress * control[index] +
    progress * progress * to[index] * 0.82
  ) as Vector;
}

export function RemoteDeliveryGlobe({
  onActiveChange
}: {
  onActiveChange: (index: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const interaction = useRef({
    paused: false,
    dragging: false,
    offset: 0
  });
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const context = overlay.getContext('2d');
    if (!context) return;

    const surface = surfaceRef.current;
    const control = interaction.current;
    const labels = labelRefs.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const theta = -0.65;
    const scale = 1;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let width = Math.max(1, canvas.getBoundingClientRect().width);
    let frame = 0;
    let previous = 0;
    let time = 0;
    let notifiedIndex = -2;
    let visible = false;
    let draggingX = 0;
    let phi = -Math.PI / 2 - deliveries[0].location[1] * Math.PI / 180;
    let dark = 1;
    let baseColor: Vector = [0.58, 0.65, 0.75];
    let arcColor = 'rgb(123, 170, 220)';

    function updateTheme() {
      const probe = document.createElement('span');
      probe.style.color = 'var(--background)';
      document.documentElement.appendChild(probe);
      const background = getComputedStyle(probe).color;
      probe.style.color = 'var(--foreground)';
      const foreground = getComputedStyle(probe).color;
      probe.remove();

      dark = background === foreground ? 1
        : document.documentElement.classList.contains('dark') ||
          background === 'rgb(0, 0, 0)' ? 1 : 0;

      baseColor = dark ? [0.58, 0.65, 0.75] : [0.94, 0.935, 0.925];
      if (canvas) {
        canvas.style.filter = dark
          ? 'none'
          : 'brightness(1.6) contrast(1.3)';
        canvas.style.mixBlendMode = dark ? 'normal' : 'multiply';
        canvas.style.maskImage = 'radial-gradient(circle closest-side, black 79.7%, transparent 80.2%)';
      }
      if (surface) {
        surface.style.display = dark ? 'none' : 'block';
      }
      arcColor = dark ? 'rgb(123, 170, 220)' : 'rgb(85, 91, 100)';
    }

    function resize() {
      width = Math.max(1, canvas?.getBoundingClientRect().width ?? 1);
      if (!overlay || !context) return;
      overlay.width = Math.round(width * ratio);
      overlay.height = Math.round(width * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function project(point: Vector, angle: number) {
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const x = cosine * point[0] + sine * point[2];
      const y = sine * sinTheta * point[0] +
        cosTheta * point[1] - cosine * sinTheta * point[2];
      const z = -sine * cosTheta * point[0] +
        sinTheta * point[1] + cosine * cosTheta * point[2];

      return {
        x: width * (1 + x * scale) / 2,
        y: width * (1 - y * scale) / 2,
        visible: z >= 0 || Math.hypot(x, y) >= 0.8
      };
    }

    updateTheme();
    resize();

    let globe: ReturnType<typeof createGlobe>;

    try {
      if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) {
        return;
      }

      globe = createGlobe(canvas, {
        devicePixelRatio: ratio,
        width,
        height: width,
        phi,
        theta,
        scale,
        dark,
        diffuse: dark ? 1.4 : 0.7,
        mapSamples: 36000,
        mapBrightness: dark ? 4 : 2.7,
        mapBaseBrightness: 0.025,
        baseColor,
        markerColor: [0.5, 0.7, 0.95],
        glowColor: dark ? [0.08, 0.11, 0.16] : [0.72, 0.72, 0.71],
        markerElevation: 0.02,
        markers: deliveries.map(delivery => ({
          location: delivery.location,
          size: 0.012
        }))
      });

      if (fallbackRef.current) fallbackRef.current.hidden = true;
    } catch {
      return;
    }

    const libraryWrapper = canvas.parentElement;

    function animate(timestamp: number) {
      if (!context || !overlay) return;

      const delta = previous ? Math.min(timestamp - previous, 50) : 0;
      previous = timestamp;
      const running = visible && !document.hidden &&
        !control.paused && !control.dragging && !reduced.matches;

      if (running) time += delta;

      const chapterDuration = 6200;
      const index = reduced.matches ? 0
        : Math.floor(time / chapterDuration) % deliveries.length;
      const chapterTime = reduced.matches ? 3000 : time % chapterDuration;
      const delivery = deliveries[index];

      if (running) {
        const target = -Math.PI / 2 - delivery.location[1] * Math.PI / 180;
        const difference = Math.atan2(Math.sin(target - phi), Math.cos(target - phi));
        phi += difference * Math.min(1, delta * 0.0017);
      }

      const angle = phi + control.offset;

      if (visible && !document.hidden) {
        globe.update({
          phi: angle,
          width,
          height: width,
          dark,
          diffuse: dark ? 1.4 : 0.7,
          mapBrightness: dark ? 4 : 2.7,
          markerColor: dark ? [0.5, 0.7, 0.95] : [0.35, 0.38, 0.42],
          baseColor,
          glowColor: dark ? [0.08, 0.11, 0.16] : [0.72, 0.72, 0.71]
        });
      }

      context.clearRect(0, 0, width, width);

      if (visible) {
        const previousDelivery = deliveries[
          (index + deliveries.length - 1) % deliveries.length
        ];
        const from = vector(previousDelivery.location);
        const to = vector(delivery.location);
        const travel = Math.min(1, chapterTime / 1800);

        context.strokeStyle = arcColor;
        context.lineWidth = Math.max(1, width / 550);
        context.globalAlpha = 0.7;
        context.beginPath();

        let drawing = false;
        for (let sample = 0; sample <= 80; sample++) {
          const progress = sample / 80 * travel;
          const point = project(arcPoint(from, to, progress), angle);
          if (!point.visible) {
            drawing = false;
            continue;
          }
          if (drawing) context.lineTo(point.x, point.y);
          else context.moveTo(point.x, point.y);
          drawing = true;
        }
        context.stroke();

        const pulse = project(arcPoint(from, to, travel), angle);
        if (pulse.visible && chapterTime < 2300) {
          context.globalAlpha = 1;
          context.fillStyle = arcColor;
          context.shadowColor = arcColor;
          context.shadowBlur = dark ? 8 : 0;
          context.beginPath();
          context.arc(pulse.x, pulse.y, Math.max(2, width / 170), 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        }

        const endpoint = project(to.map(value => value * 0.82) as Vector, angle);
        const activeIndex = endpoint.visible && chapterTime >= 1900 ? index : -1;

        if (activeIndex !== notifiedIndex) {
          notifiedIndex = activeIndex;
          onActiveChange(activeIndex);
        }
        if (endpoint.visible && chapterTime >= 1800) {
          const pulseRadius = 4 + ((chapterTime - 1800) % 1400) / 1400 * 12;
          context.globalAlpha = 0.45 * (1 - (pulseRadius - 4) / 12);
          context.beginPath();
          context.arc(endpoint.x, endpoint.y, pulseRadius, 0, Math.PI * 2);
          context.stroke();
        }
        context.globalAlpha = 1;

        labels.forEach((label, labelIndex) => {
          if (!label) return;

          if (labelIndex !== index || !endpoint.visible || chapterTime < 1900) {
            label.style.opacity = '0';
            label.style.visibility = 'hidden';
            return;
          }

          const fadeIn = Math.min(1, (chapterTime - 1900) / 300);
          const fadeOut = Math.min(1, (chapterDuration - chapterTime) / 400);
          const left = Math.max(8, Math.min(width - label.offsetWidth - 8,
            endpoint.x - label.offsetWidth / 2));
          const viewport = canvas?.closest('[data-globe-viewport]');
          const viewportBounds = viewport?.getBoundingClientRect();
          const canvasBounds = canvas?.getBoundingClientRect();

          const visibleTop = viewportBounds && canvasBounds
            ? Math.max(8, viewportBounds.top - canvasBounds.top + 8)
            : 8;
          const visibleBottom = viewportBounds && canvasBounds
            ? Math.min(width - 8, viewportBounds.bottom - canvasBounds.top - 8)
            : width - 8;
          const top = Math.max(
            visibleTop,
            Math.min(
              visibleBottom - label.offsetHeight,
              endpoint.y - label.offsetHeight - 16
            )
          );

          label.style.left = left + 'px';
          label.style.top = top + 'px';
          label.style.opacity = String(Math.min(fadeIn, fadeOut));
          label.style.visibility = 'visible';
          label.style.transform = 'translateY(' + ((1 - fadeIn) * 6) + 'px)';
        });
      }

      frame = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      previous = 0;
    }, { threshold: 0.1 });
    intersection.observe(canvas);

    const theme = new MutationObserver(updateTheme);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme']
    });

    function down(event: PointerEvent) {
      if (event.button !== 0) return;
      control.dragging = true;
      draggingX = event.clientX;
      canvas?.setPointerCapture(event.pointerId);
    }

    function move(event: PointerEvent) {
      if (!control.dragging) return;
      control.offset += (event.clientX - draggingX) * 0.006;
      draggingX = event.clientX;
    }

    function release() {
      control.dragging = false;
    }

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('lostpointercapture', release);
    window.addEventListener('blur', release);
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      theme.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', release);
      canvas.removeEventListener('pointercancel', release);
      canvas.removeEventListener('lostpointercapture', release);
      window.removeEventListener('blur', release);
      globe.destroy();

      if (libraryWrapper && libraryWrapper !== canvas.parentElement?.parentElement &&
          libraryWrapper.parentElement && canvas.parentElement === libraryWrapper) {
        libraryWrapper.parentElement.insertBefore(canvas, libraryWrapper);
        libraryWrapper.remove();
      }
      control.dragging = false;
    };
  }, [onActiveChange]);

  return (
    <figure className="min-w-0">
      <div className="relative mx-auto aspect-square w-full max-w-none">
        <div
          ref={surfaceRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-[10%] rounded-full bg-background/80"
          style={{
            display: 'none',
            boxShadow: '0 2px 5px rgba(25, 30, 35, 0.025), inset 0 0 0 1px var(--border)'
          }}
        />
        <div
          ref={fallbackRef}
          aria-hidden="true"
          className="absolute inset-[14%] rounded-full border border-border-strong bg-surface-subtle"
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 size-full cursor-grab touch-pan-y active:cursor-grabbing"
        />
        <canvas
          ref={overlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 size-full"
        />

        {deliveries.map((delivery, index) => (
          <div
            key={delivery.city}
            ref={element => { labelRefs.current[index] = element; }}
            aria-hidden="true"
            style={{ opacity: 0, visibility: 'hidden' }}
            className="pointer-events-none absolute z-20 w-40 rounded-lg border border-border-strong bg-background/95 p-2.5 shadow-sm backdrop-blur-sm sm:w-48">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold">{delivery.city}</p>
              <span className="font-mono text-xs font-semibold">{delivery.bill}</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5">{delivery.name}</p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Sample delivery / USD
            </p>
          </div>
        ))}
      </div>

      <figcaption className="sr-only">
        Illustrative projects and bills in USD. Not completed-job claims or fixed quotes.
      </figcaption>

      <ul className="sr-only">
        {deliveries.map(delivery => (
          <li key={delivery.city}>
            {delivery.city}: {delivery.name}. {delivery.category}.
            {delivery.scope}. Illustrative bill: {delivery.bill} USD.
          </li>
        ))}
      </ul>
    </figure>
  );
}

import React, { useMemo } from "react";

/**
 * Ambient animated particle background — soft floating/twinkling dots plus a
 * couple of blurred glow orbs for depth. Pure CSS animations (no deps).
 *
 * Responsive: dots are positioned in % so they scale with any viewport, and
 * the count auto-reduces on small screens. Respects prefers-reduced-motion.
 */
export default function ParticlesBackground({ count = 42 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 2 + Math.random() * 6;
        return {
          id: i,
          left: Math.random() * 100, // %
          top: Math.random() * 100, // %
          size, // px
          duration: 7 + Math.random() * 9, // s
          delay: -Math.random() * 12, // s (negative = mid-cycle start)
          drift: (Math.random() * 2 - 1) * 26, // px horizontal sway
          opacity: 0.15 + Math.random() * 0.45,
        };
      }),
    [count]
  );

  return (
    <div className="particles pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* soft glow orbs for depth */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />

      {particles.map((p) => (
        <span
          key={p.id}
          className="particle absolute rounded-full bg-emerald-200"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            "--drift": `${p.drift}px`,
            "--o": p.opacity,
          }}
        />
      ))}

      <style>{`
        @keyframes particleFloat {
          0%   { transform: translate(0, 0) scale(0.9); opacity: calc(var(--o) * 0.35); }
          50%  { transform: translate(var(--drift), -34px) scale(1.15); opacity: var(--o); }
          100% { transform: translate(0, 0) scale(0.9); opacity: calc(var(--o) * 0.35); }
        }
        /* Thin the field out on small screens for performance */
        @media (max-width: 640px) {
          .particles .particle:nth-child(2n) { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .particles .particle { animation: none !important; opacity: var(--o); }
        }
      `}</style>
    </div>
  );
}

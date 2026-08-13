const STARS = [
  { top: "12%", left: "8%", size: 6, delay: "0s" },
  { top: "22%", left: "88%", size: 4, delay: "0.4s" },
  { top: "68%", left: "92%", size: 5, delay: "0.8s" },
  { top: "80%", left: "6%", size: 3, delay: "1.2s" },
  { top: "40%", left: "48%", size: 3, delay: "0.6s" },
  { top: "6%", left: "60%", size: 5, delay: "1s" },
];

export function StarField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-1/3 top-[-20%] size-[70vmin] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-nova), transparent 70%)" }}
      />
      <div
        className="absolute -left-1/4 bottom-[-25%] size-[60vmin] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-cosmic), transparent 70%)" }}
      />
      {STARS.map((star, i) => (
        <span
          key={i}
          className="absolute animate-pulse rounded-full bg-marigold"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

import type { CSSProperties } from "react";

const particles = [
  {
    left: "8%",
    top: "18%",
    size: "3px",
    x: "80px",
    y: "-120px",
    duration: "22s",
    delay: "0s",
  },
  {
    left: "18%",
    top: "72%",
    size: "2px",
    x: "120px",
    y: "-90px",
    duration: "26s",
    delay: "3s",
  },
  {
    left: "32%",
    top: "36%",
    size: "2px",
    x: "-90px",
    y: "-140px",
    duration: "24s",
    delay: "6s",
  },
  {
    left: "48%",
    top: "82%",
    size: "3px",
    x: "70px",
    y: "-160px",
    duration: "28s",
    delay: "2s",
  },
  {
    left: "64%",
    top: "24%",
    size: "2px",
    x: "-120px",
    y: "100px",
    duration: "25s",
    delay: "5s",
  },
  {
    left: "78%",
    top: "58%",
    size: "3px",
    x: "-80px",
    y: "-130px",
    duration: "30s",
    delay: "1s",
  },
  {
    left: "88%",
    top: "14%",
    size: "2px",
    x: "-140px",
    y: "120px",
    duration: "27s",
    delay: "7s",
  },
  {
    left: "92%",
    top: "84%",
    size: "2px",
    x: "-110px",
    y: "-100px",
    duration: "23s",
    delay: "4s",
  },
];

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="absolute left-[-10%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-[-15%] right-[-10%] h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl" />

      {particles.map((particle, index) => (
        <span
          key={index}
          className="particle absolute rounded-full bg-blue-400/70"
          style={
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              "--drift-x": particle.x,
              "--drift-y": particle.y,
              "--duration": particle.duration,
              "--delay": particle.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

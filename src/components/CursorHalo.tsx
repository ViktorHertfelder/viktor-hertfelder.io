"use client";

import { useEffect, useRef } from "react";

const TRAIL_LENGTH = 8;
const HALO_SIZE = 50;
const HALO_OFFSET = HALO_SIZE / 2;
const IDLE_TIMEOUT = 250;

type Point = {
  x: number;
  y: number;
};

export default function CursorHalo() {
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const positions = useRef<Point[]>(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 })),
  );
  const target = useRef<Point>({ x: -100, y: -100 });
  const frameId = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);
  const isVisible = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    function lerp(start: number, end: number, amount: number) {
      return start + (end - start) * amount;
    }

    function hideTrail() {
      isVisible.current = false;
    }

    function animate() {
      positions.current.forEach((position, index) => {
        const followTarget =
          index === 0 ? target.current : positions.current[index - 1];

        const speed = index === 0 ? 0.32 : 0.24;

        position.x = lerp(position.x, followTarget.x, speed);
        position.y = lerp(position.y, followTarget.y, speed);

        const element = trailRefs.current[index];

        if (element) {
          const opacity = isVisible.current
            ? Math.max(0.03, 0.28 - index * 0.035)
            : 0;

          element.style.opacity = String(opacity);
          element.style.transform = `translate3d(${
            position.x - HALO_OFFSET
          }px, ${position.y - HALO_OFFSET}px, 0)`;
        }
      });

      frameId.current = requestAnimationFrame(animate);
    }

    function handlePointerMove(event: PointerEvent) {
      target.current = {
        x: event.clientX,
        y: event.clientY,
      };

      isVisible.current = true;

      if (!hasInitialized.current) {
        hasInitialized.current = true;

        positions.current = positions.current.map(() => ({
          x: event.clientX,
          y: event.clientY,
        }));
      }

      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }

      idleTimeoutRef.current = window.setTimeout(() => {
        hideTrail();
      }, IDLE_TIMEOUT);
    }

    function handlePointerLeave() {
      hideTrail();

      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mouseleave", handlePointerLeave);

    frameId.current = requestAnimationFrame(animate);

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }

      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }

      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden md:block"
    >
      {Array.from({ length: TRAIL_LENGTH }).map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            trailRefs.current[index] = element;
          }}
          className="absolute left-0 top-0 h-[50px] w-[50px] rounded-full bg-blue-400 blur-lg mix-blend-screen opacity-0 transition-opacity duration-300 will-change-transform"
        />
      ))}
    </div>
  );
}

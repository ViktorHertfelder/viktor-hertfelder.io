import Image from "next/image";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 pt-32 pb-20 sm:px-8 lg:px-12">
      <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col">
          <span className="mb-4 text-xs uppercase tracking-[0.18em] text-zinc-500 sm:text-sm">
            Softwareentwickler & technischer Problemlöser
          </span>

          <h1 className="mb-8 max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
            Gute Software beginnt mit einem Gespräch.
          </h1>

          <p className="mb-8 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
            Ich unterstütze Unternehmen und Teams bei der Entwicklung
            individueller Softwarelösungen – verständlich, direkt und ohne
            unnötige Komplexität.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="rounded-xl bg-[var(--accent)] px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-[1.02] text-center sm:text-left"
              href="#contact"
            >
              Projekt besprechen
            </a>

            <a
              className="rounded-xl border border-white/10 px-6 py-3 font-medium transition-all duration-300 hover:border-white/30"
              href="#projects"
            >
              Projekte ansehen
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-blue-500/10 sm:max-w-[380px] lg:max-w-[460px]">
            <Image
              src="/images/Portfolio-Image.jpeg"
              alt="Viktor Hertfelder"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

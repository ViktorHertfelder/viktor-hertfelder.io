export default function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 lg:p-14">
        <span className="mb-3 block text-sm uppercase tracking-[0.2em] text-zinc-500">
          Kontakt
        </span>

        <h2 className="mb-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Lassen Sie uns über Ihr Projekt sprechen.
        </h2>

        <p className="mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Sie haben eine Idee, ein bestehendes Problem oder benötigen
          Unterstützung in einem laufenden Projekt? Schreiben Sie mir einfach
          eine Nachricht.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:viktor@hertfelder.io"
            className="rounded-lg bg-blue-500 px-6 py-3 text-center font-medium text-white transition hover:bg-blue-400"
          >
            E-Mail schreiben
          </a>

          <a
            href="https://www.linkedin.com/in/viktor-hertfelder-308169294/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-center font-medium transition hover:border-zinc-500"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

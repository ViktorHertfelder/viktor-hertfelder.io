export default function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <span className="mb-3 block text-sm uppercase tracking-[0.2em] text-zinc-500">
            Über mich
          </span>

          <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Technik verstehen. Dinge verbessern.
          </h2>
        </div>

        <div className="space-y-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
          <p>
            Ich bin Viktor, Softwareentwickler aus Dresden. Mich fasziniert
            Technik in vielen Formen – beruflich entwickle ich leidenschaftlich
            Software, privat beschäftige ich mich sowohl mit eigenen
            Softwareprojekten, 3D-Druck als auch dem Schrauben an Motorrädern.
          </p>

          <p>
            Was beide Welten gemeinsam haben: Ich möchte verstehen, wie Dinge
            funktionieren und wie man sie sinnvoll verbessern kann. Genau diese
            Denkweise bringe ich auch in Kundenprojekte ein.
          </p>

          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="mb-2 text-2xl">🏍️</p>
              <h3 className="font-semibold text-white">Motorräder</h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="mb-2 text-2xl">🖨️</p>
              <h3 className="font-semibold text-white">3D-Druck</h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="mb-2 text-2xl">💡</p>
              <h3 className="font-semibold text-white">Eigene Projekte</h3>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="border-t border-white/10" />
          </div>

          <div className="space-y-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
            <p>
              Bald: LABS - Einblicke in meine privaten Projekte, egal ob
              Software, 3D-Druck oder Dinge mit denen ich mich sonst so
              beschäftige.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

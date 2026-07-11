"use client";

import { useState } from "react";
import { projects } from "@/data/projects";
import ReferenceLogos from "@/components/sections/referenceLogos";

export default function Projects() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedProject = projects[selectedIndex];

  return (
    <section
      id="projects"
      className="relative z-20 mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="mb-10 sm:mb-14">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Referenzen
        </span>

        <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Projekte, die einen Einblick in meine Arbeit geben.
        </h2>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="-mx-6 overflow-x-auto pb-4 sm:-mx-8">
          <div className="flex snap-x snap-mandatory items-start gap-4 px-6 sm:px-8">
            {projects.map((project, index) => (
              <article
                key={project.title}
                className="w-[86vw] shrink-0 snap-center rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:w-[420px] sm:p-6"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-blue-400">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(projects.length).padStart(2, "0")}
                  </span>

                  <span className="text-xs text-zinc-500">Swipe</span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {project.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-400"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <h3 className="mb-4 break-words text-2xl font-semibold leading-tight text-white">
                  {project.title}
                </h3>

                <p className="mb-5 text-sm leading-7 text-zinc-400">
                  {project.shortDescription}
                </p>

                <div className="border-t border-white/10 pt-5">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Beschreibung
                  </p>

                  <p className="text-sm leading-7 text-zinc-300">
                    {project.description ?? project.shortDescription}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 border-t border-white/10 pt-5">
                  {project.client && (
                    <div>
                      <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Kunde / Kontext
                      </p>
                      <p className="text-sm text-zinc-300">{project.client}</p>
                    </div>
                  )}

                  {project.employer && (
                    <div>
                      <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Unternehmen
                      </p>
                      <p className="text-sm text-zinc-300">
                        {project.employer}
                      </p>
                    </div>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Technologien
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-zinc-300"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}

            <div className="w-2 shrink-0 sm:w-4" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden items-start gap-6 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
        {selectedProject && (
          <article className="self-start rounded-3xl border border-blue-400/20 bg-white/[0.03] p-10 shadow-2xl shadow-blue-500/5">
            <div className="mb-5 flex flex-wrap gap-2">
              {selectedProject.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400"
                >
                  {category}
                </span>
              ))}
            </div>

            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-blue-400">
              Ausgewähltes Projekt
            </p>

            <h3 className="mb-4 max-w-3xl break-words text-4xl font-semibold leading-tight text-white">
              {selectedProject.title}
            </h3>

            <p className="mb-8 max-w-3xl text-base leading-8 text-zinc-400">
              {selectedProject.shortDescription}
            </p>

            <div className="grid gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Beschreibung
                </p>

                <p className="max-w-3xl text-base leading-8 text-zinc-300">
                  {selectedProject.description ??
                    selectedProject.shortDescription}
                </p>
              </div>

              {(selectedProject.client || selectedProject.employer) && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {selectedProject.client && (
                    <div>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Kunde / Kontext
                      </p>
                      <p className="text-base text-zinc-300">
                        {selectedProject.client}
                      </p>
                    </div>
                  )}

                  {selectedProject.employer && (
                    <div>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Unternehmen
                      </p>
                      <p className="text-base text-zinc-300">
                        {selectedProject.employer}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedProject.technologies &&
                selectedProject.technologies.length > 0 && (
                  <div>
                    <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Technologien
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-zinc-300"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </article>
        )}

        <div className="grid max-h-[calc(100vh-10rem)] gap-4 overflow-y-auto pr-2 thin-scrollbar">
          {projects.map((project, index) => {
            const isSelected = selectedIndex === index;

            return (
              <button
                key={project.title}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={[
                  "rounded-2xl border p-6 text-left transition-all duration-300",
                  isSelected
                    ? "border-blue-400/50 bg-blue-400/[0.06]"
                    : "border-white/10 bg-white/[0.025] hover:border-blue-400/30 hover:bg-white/[0.04]",
                ].join(" ")}
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  {project.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-400"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <h3 className="mb-3 break-words text-2xl font-semibold leading-tight text-white">
                  {project.title}
                </h3>

                <p className="mb-5 text-base leading-7 text-zinc-400">
                  {project.shortDescription}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span
                    className={isSelected ? "text-blue-400" : "text-zinc-500"}
                  >
                    {isSelected ? "Wird angezeigt" : "Details anzeigen"}
                  </span>

                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full border text-lg transition",
                      isSelected
                        ? "border-blue-400/50 text-blue-400"
                        : "border-white/10 text-zinc-400",
                    ].join(" ")}
                  >
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <ReferenceLogos />
    </section>
  );
}

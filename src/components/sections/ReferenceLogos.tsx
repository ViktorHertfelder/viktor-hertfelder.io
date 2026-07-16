type ReferenceLogo = {
  name: string;
  logo: string;
  href?: string;
  mode?: "original" | "invert" | "muted";
};

const references: ReferenceLogo[] = [
  {
    name: "Valtech Mobility",
    logo: "/logos/mobility.svg",
    href: "https://valtech-mobility.de/",
    mode: "invert",
  },
  {
    name: "Purjfam",
    logo: "/logos/purjfam.avif",
    href: "https://purjfam.com/",
  },
  {
    name: "Shishabucks",
    logo: "/logos/shishabucks.png",
    href: "https://www.shishabucks.com/",
  },
];

function getLogoClassName(mode: ReferenceLogo["mode"]) {
  const base =
    "max-h-8 max-w-[140px] object-contain transition duration-300 group-hover:opacity-100 group-hover:drop-shadow-[0_0_18px_rgba(59,130,246,0.45)] sm:max-h-9 sm:max-w-[160px]";

  switch (mode) {
    case "invert":
      return `${base} brightness-0 invert opacity-60`;

    case "muted":
      return `${base} grayscale opacity-50 group-hover:grayscale-0`;

    default:
      return `${base} opacity-70`;
  }
}

export default function ReferenceLogos() {
  return (
    <div className="mt-10 sm:mt-12">
      <p className="mb-6 text-xs uppercase tracking-[0.22em] text-zinc-500">
        Unternehmen mit denen ich bereits zusammengearbeitet habe:
      </p>

      <div className="flex flex-wrap items-center gap-y-6">
        {references.map((reference, index) => (
          <div key={reference.name} className="flex items-center">
            {index > 0 && (
              <div
                className="mx-6 hidden h-8 w-px bg-white/10 sm:block"
                aria-hidden="true"
              />
            )}

            <a
              href={reference.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${reference.name} Webseite öffnen`}
              className="group flex h-12 w-40 items-center justify-center transition duration-300 hover:-translate-y-0.5 sm:w-48"
            >
              <img
                src={reference.logo}
                alt={reference.name}
                title={reference.name}
                className={getLogoClassName(reference.mode)}
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

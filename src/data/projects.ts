export type Project = {
  title: string;
  shortDescription: string;
  description?: string;
  client?: string;
  employer?: string;
  technologies?: string[];
  categories: string[];
};

export const projects = [
  {
    title: "Preisüberwachungssystem",
    shortDescription:
      "Automatisierte Überwachung internationaler Produktpreise zur frühzeitigen Erkennung von Preisabweichungen.",
    description:
      "Entwicklung eines Preisüberwachungssystems zur automatisierten Überwachung internationaler Händlerpreise. Das System ermöglicht die Erkennung von Preisabweichungen und unterstützt das Unternehmen eine einheitliche Preisstrategie zu verfolgen. Dabei werden per Webscraping die Preise der Händler in echtzeit erfasst, nach Produkt kategorisiert und in US-Dollar umgerechnet.",
    client: "Purjfam",
    technologies: ["Java", "Jsoup", "Maven"],
    categories: ["Web", "Backend", "Automation"],
  },
  {
    title: "VHAM - VHAL and ADB Manipulator",
    shortDescription:
      "Ein Werkzeug zum Manipulieren von Android und AAOS Systemen per ADB.",
    description:
      "Konzeption, Planung und Umsetzung eines Entwicklungs-Werkzeug spezifisch für die Entwicklung an Android Automotive OS (AAOS) Systemen. " +
      "Der Fokus der Anwendung lag darauf, alltägliche repetetive Einstellungen an Testsystemen zu vereinfachen sowie die Steuerung des Vehicle Hardware Abstraction Layer (VHAL) nutzerfreundlicher zu machen. " +
      "Funktionen wie das aktivieren/deaktivieren von WLAN, Bluetooth, etc. als auch das Einstellen des Datums under Uhrzeit aber auch das initiale verbinden mit dem Testgerät sind nur ein kleiner Teil gewesen und haben eine eigene Sektion bekommen. " +
      "Ein weiter und sehr wichtiger Teil ist das Verwalten des Caches und installieren/ deinstallieren von Apps. " +
      "Aber auch eine eigene vereinfachte Kommandozeile hat ihren Platz gefunden. Hintergrund für dieses Projekt ist, dass man nicht immer Physischen zugriff auf ein Testsytem hat oder einen Emulator nutzen kann.",
    technologies: [
      "Android",
      "AAOS",
      "Kotlin",
      "Kotlin Multiplatform",
      "Compose Multiplatform",
      "Gradle",
    ],
    categories: ["Desktop", "Development", "Android"],
  },
  {
    title: "Trainingsorganisationsplattform",
    shortDescription:
      "Zentrale Verwaltung von Schulungen, Teilnehmern und Veranstaltungen.",
    technologies: [
      "React",
      "TypeScript",
      "Java",
      "Spring-Boot",
      "Maven",
      "PostgreSQL",
    ],
    employer: "Valtech Mobility",
    categories: ["Web", "Management", "Backend"],
  },
  {
    title: "MBB Core",
    shortDescription:
      "Entwicklung und Wartung von Microservices für den MBB Core.",
    technologies: ["Java", "Spring-Boot", "Maven", "PostgreSQL"],
    categories: ["Backend"],
    employer: "Valtech Mobility",
  },
  {
    title: "Drivetracker",
    shortDescription:
      "Eine Webanwendung zum tracken von Rundenzeiten im Sim-Racing mit Freunden.",
    technologies: ["React", "TypeScript", "Kotlin", "Spring-Boot"],
    categories: ["Web", "Backend"],
  },
  {
    title: "Wordpress Support",
    shortDescription:
      "Support eines Wordpress Onlineshops. Administration, Bugfixing und Weiterentwicklung.",
    technologies: ["PHP", "Wordpress", "WooCommerce"],
    categories: ["Web", "E-Commerce"],
    client: "Shishabucks",
  },
  {
    title: "Audi Sonic Sphere",
    shortDescription:
      "Eine Prototypen-App die es ermöglicht hat, dass Musik auf aktuelle Fahrsituationen reagiert. Nahezu in echtzeit.",
    technologies: ["Kotlin", "AAOS", "Android", "Oboe"],
    categories: ["Automotive"],
    employer: "Valtech Mobility",
  },
];

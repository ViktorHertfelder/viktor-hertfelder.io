export type Project = {
  title: string;
  shortDescription: string;
  description?: string;
  client?: string;
  employer?: string;
  technologies?: string[];
  categories: string[];
};

export const projects: Project[] = [
  {
    title: "B2B-Preisüberwachungssystem",
    shortDescription:
      "Automatisierte Überwachung internationaler Produktpreise zur frühzeitigen Erkennung von Preisabweichungen.",
    description:
      "Entwicklung eines automatisierten Systems zur Überwachung internationaler Händlerpreise. Produktpreise werden per Webscraping erfasst, nach Produkten und Händlern kategorisiert und unter Berücksichtigung verschiedener Währungen vergleichbar gemacht. Dadurch können Preisabweichungen frühzeitig erkannt und eine einheitliche Preisstrategie unterstützt werden.",
    client: "Purjfam",
    technologies: ["Java", "Jsoup", "Maven"],
    categories: ["Backend", "Automation", "Web Scraping"],
  },
  {
    title: "Technische Betreuung eines WooCommerce-Shops",
    shortDescription:
      "Administration, Absicherung und Fehlerbehebung eines produktiven WordPress- und WooCommerce-Onlineshops.",
    description:
      "Technische Betreuung eines produktiven Onlineshops inklusive vollständiger Backups, Fehleranalyse und Wiederherstellung gestörter Geschäftsprozesse. Ein Schwerpunkt lag auf der Untersuchung von WooCommerce-Schnittstellen sowie automatisierten Produkt-, Bestands- und Versandprozessen. Zusätzlich wurden Server-, Datenbank- und Anwendungslogs ausgewertet, um fehlerhafte Synchronisationen und unerwartete Produktänderungen nachzuvollziehen.",
    client: "Shishabucks",
    technologies: [
      "WordPress",
      "WooCommerce",
      "PHP",
      "Plesk",
      "MariaDB",
      "REST API",
    ],
    categories: ["Web", "E-Commerce", "Support", "Administration"],
  },
  {
    title: "Datenquellenverwaltung",
    shortDescription:
      "Entwicklung eines zentralen Services zur Verwaltung von Produktionsmaschinen, Datenquellen und Maschinenkonfigurationen.",
    description:
      "Konzeption und Entwicklung eines Microservices zur Verwaltung und Konfiguration von Produktionsmaschinen und angebundenen Datenquellen. Zusätzlich erfolgte die Weiterentwicklung des zentralen Backends und Frontends der Plattform.",
    employer: "Symate GmbH",
    technologies: [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "Liquibase",
      "TypeScript",
      "Vue.js",
      "Quasar",
      "GitLab CI",
    ],
    categories: ["Web", "Backend", "Frontend", "Industry"],
  },
  {
    title: "Automatisierte Teststrategie",
    shortDescription:
      "Einführung einer umfassenden Teststrategie für Backend- und Frontend-Anwendungen.",
    description:
      "Konzeption und Einführung einer Teststrategie für verschiedene Komponenten einer industriellen Softwareplattform. Dazu gehörten testgetriebene Backend-Entwicklung, Integrations- und Datenbanktests sowie die Umsetzung einer automatisierten Frontend-Testumgebung. Die Tests wurden in die bestehenden Entwicklungs- und CI-Prozesse integriert.",
    employer: "Symate GmbH",
    technologies: [
      "JUnit 5",
      "AssertJ",
      "Mockito",
      "H2",
      "Testcontainers",
      "Nightwatch.js",
      "TypeScript",
      "GitLab CI",
    ],
    categories: ["Testing", "Automation", "Quality Assurance"],
  },
  {
    title: "Zentrale Java-Softwarebibliotheken",
    shortDescription:
      "Wartung und Weiterentwicklung gemeinsam genutzter Softwarebibliotheken und Build-Prozesse.",
    description:
      "Wartung und Weiterentwicklung verschiedener Java-Bibliotheken, die innerhalb des Unternehmens von mehreren Anwendungen und Entwicklungsteams eingesetzt wurden. Dazu gehörten die Weiterentwicklung bestehender Schnittstellen, die Pflege der Maven-Konfigurationen sowie die Integration in automatisierte GitLab-CI-Prozesse.",
    employer: "Symate GmbH",
    technologies: ["Java", "Spring Boot", "Maven", "GitLab CI"],
    categories: ["Backend", "Libraries", "DevOps"],
  },
  {
    title: "VHAM – VHAL and ADB Manipulator",
    shortDescription:
      "Desktop-Werkzeug zur Steuerung und Konfiguration von Android- und Automotive-Testgeräten über ADB.",
    description:
      "Planung und Entwicklung eines plattformübergreifenden Entwicklungswerkzeugs für Audi- und Porsche-Testsysteme. Die Anwendung vereinfacht wiederkehrende Aufgaben wie das Verbinden mit Testgeräten, das Ändern von Systemeinstellungen sowie das Installieren, Deinstallieren und Verwalten von Anwendungen. Zusätzlich können Eigenschaften des Vehicle Hardware Abstraction Layer komfortabel ausgelesen und verändert werden.",
    employer: "Valtech Mobility",
    technologies: [
      "Kotlin",
      "Compose Multiplatform",
      "Kotlin Multiplatform",
      "Android",
      "Android Automotive OS",
      "ADB",
      "Gradle",
    ],
    categories: ["Desktop", "Development Tools", "Android", "Automotive"],
  },
  {
    title: "Audi Sonic Sphere",
    shortDescription:
      "Prototyp einer Automotive-App, die Musik dynamisch an aktuelle Fahrsituationen anpasst.",
    description:
      "Entwicklung einer Prototypen-App für Android Automotive OS, mit der Musik nahezu in Echtzeit auf unterschiedliche Fahrsituationen reagiert. Hierfür wurden Fahrzeug- und Sensordaten verarbeitet und zur dynamischen Steuerung der Audiowiedergabe eingesetzt.",
    employer: "Valtech Mobility",
    technologies: [
      "Kotlin",
      "Android",
      "Android Automotive OS",
      "Jetpack Compose",
      "Compose Multiplatform",
      "XML",
      "Oboe",
      "Gradle",
    ],
    categories: ["Android", "Automotive", "Audio", "Prototype"],
  },
  {
    title: "VW MBB Core",
    shortDescription:
      "Entwicklung und Wartung von Microservices für eine Plattform mit mehr als 30 Millionen registrierten Fahrzeugen.",
    description:
      "Weiterentwicklung und Wartung verschiedener Microservices für eine zentrale Onlineplattform des Volkswagen-Konzerns. Zu den Aufgaben gehörten die Implementierung neuer Funktionen, die Analyse und Behebung von Fehlern sowie die Absicherung der Services durch automatisierte Tests und Architekturprüfungen.",
    employer: "Valtech Mobility",
    technologies: [
      "Java",
      "Spring Boot",
      "Maven",
      "JUnit 5",
      "AssertJ",
      "Mockito",
      "WireMock",
      "ArchUnit",
    ],
    categories: ["Backend", "Microservices", "Automotive"],
  },
  {
    title: "Abgleich von Zugangsberechtigungen",
    shortDescription:
      "Automatisierter Abgleich von Zugangsberechtigungen zwischen unterschiedlichen Datenquellen.",
    description:
      "Entwicklung einer Anwendung zur automatisierten Prüfung und Synchronisation von Zugangsberechtigungen. Die Anwendung vergleicht vorhandene Berechtigungsdaten mit den Einträgen eines zentralen Verzeichnisdienstes und macht Abweichungen nachvollziehbar.",
    employer: "Valtech Mobility",
    technologies: ["Java", "Spring Boot", "Maven", "LDAP"],
    categories: ["Backend", "Automation", "Identity Management"],
  },
  {
    title: "Loganalyse auf Kundensystemen",
    shortDescription:
      "Weiterentwicklung einer internen Webanwendung zur zentralen Abfrage und Analyse von Logdateien.",
    description:
      "Weiterentwicklung einer intern genutzten Software zur Abfrage und Auswertung von Logdateien auf unterschiedlichen Kundensystemen. Die Anwendung unterstützt Entwicklung und Support dabei, relevante Logeinträge zentral zu finden und technische Probleme effizienter zu analysieren.",
    employer: "Valtech Mobility",
    technologies: ["Java", "Spring Boot", "Vaadin", "Maven"],
    categories: ["Web", "Backend", "Development Tools"],
  },
  {
    title: "Monitoring-Dashboards",
    shortDescription:
      "Konzeption und Umsetzung zentraler Dashboards zur Überwachung von Anwendungen und Systemen.",
    description:
      "Planung und Implementierung von Monitoring-Dashboards für verschiedene Anwendungen und Backend-Services. Relevante technische Metriken, Fehler und Logdaten wurden strukturiert aufbereitet, um den Systemzustand transparent darzustellen und Probleme frühzeitig erkennen zu können.",
    employer: "Valtech Mobility",
    technologies: ["Dynatrace", "Kibana", "Elasticsearch", "Logstash"],
    categories: ["Monitoring", "DevOps", "Observability"],
  },
  {
    title: "Trainingsorganisationsplattform",
    shortDescription:
      "Zentrale Webanwendung zur Verwaltung von Schulungen, Teilnehmern und Veranstaltungen.",
    description:
      "Konzeption und Entwicklung einer Plattform zur zentralen Organisation von Schulungen. Die Anwendung verwaltet Teilnehmer, Trainer, Adressen und Veranstaltungen und unterstützt den Import bestehender Daten. Backend, Frontend und Datenbank wurden als eigenständige Komponenten umgesetzt.",
    employer: "Valtech Mobility",
    technologies: [
      "React",
      "TypeScript",
      "Java",
      "Spring Boot",
      "Maven",
      "PostgreSQL",
    ],
    categories: ["Web", "Backend", "Frontend", "Management"],
  },
  {
    title: "Drivetracker",
    shortDescription:
      "Webanwendung zur Erfassung und Auswertung von Rundenzeiten im Sim-Racing.",
    description:
      "Entwicklung einer privaten Webanwendung, mit der Rundenzeiten, Fahrzeuge und Strecken innerhalb einer Freundesgruppe erfasst und miteinander verglichen werden können.",
    technologies: ["React", "TypeScript", "Kotlin", "Spring Boot"],
    categories: ["Web", "Backend", "Frontend"],
  },
];

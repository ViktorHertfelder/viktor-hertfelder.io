import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:px-8 lg:px-12">
        <span>© {new Date().getFullYear()} Viktor Hertfelder</span>
        <Link href="/security/" className="transition hover:text-white">Security monitor</Link>
      </div>
    </footer>
  );
}

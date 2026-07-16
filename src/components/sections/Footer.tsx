export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-zinc-500 sm:px-8 lg:px-12">
        © {new Date().getFullYear()} Viktor Hertfelder
      </div>
    </footer>
  );
}

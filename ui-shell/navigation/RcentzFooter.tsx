export function RcentzFooter() {
  return (
    <footer className="rcentz-section py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>? {new Date().getFullYear()} Rcentz Systems.</p>
        <a
          href="mailto:dennis@rcentz.cc"
          className="hover:text-foreground">
          dennis@rcentz.cc
        </a>
      </div>
    </footer>
  );
}

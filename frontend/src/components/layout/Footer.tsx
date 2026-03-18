function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-elevated/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <span>© {new Date().getFullYear()} My Studio Notes.</span>{' '}
          <span>All rights reserved.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="opacity-70">Built with React · Tailwind · Vite</span>
          <a
            href="#"
            className="underline decoration-accent-underline-from/70 decoration-1 underline-offset-4 hover:decoration-accent-underline-to"
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

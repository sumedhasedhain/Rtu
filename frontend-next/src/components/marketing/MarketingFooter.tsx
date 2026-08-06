import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-aurora-rose/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-text-tertiary sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-violet" />
          <span>Rtu — a cycle tracking portfolio project</span>
        </div>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-text-secondary">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-text-secondary">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}

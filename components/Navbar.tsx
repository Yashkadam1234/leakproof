import Link from "next/link";
import { ArrowRight, House } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            L
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-neutral-900">
              Leakproof
            </span>

            <span className="text-xs text-neutral-500">
              AI Spend Audit
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Home Button */}
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 md:flex"
          >
            <House className="h-4 w-4" />
            Home
          </Link>

          <div className="hidden rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-600 lg:flex">
            Reduce wasted AI spend
          </div>

          <a
            href="#audit-form"
            className="group inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-neutral-800 hover:shadow-md"
          >
            Run free audit

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}
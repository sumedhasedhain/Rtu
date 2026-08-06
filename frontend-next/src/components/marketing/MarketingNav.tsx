"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/Button";

export function MarketingNav() {
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 120], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 120], [0, 0.09]);

  return (
    <motion.header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        aria-hidden
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          backgroundColor: useTransform(backgroundOpacity, (v) => `rgba(255,250,249,${v * 0.85})`),
          borderBottom: useTransform(borderOpacity, (v) => `1px solid rgba(201,79,99,${v})`),
        }}
      />
      <div className="relative mx-auto flex h-18 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-violet" />
          Rtu
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
          <Link href="#features" className="transition-colors hover:text-text-primary">
            Features
          </Link>
          <Link href="#intelligence" className="transition-colors hover:text-text-primary">
            Prediction engine
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/register">Start tracking</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

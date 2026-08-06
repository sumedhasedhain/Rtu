"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SoftGlow } from "@/components/ui/SoftGlow";
import { fadeRise, staggerChildren } from "@/lib/motion/variants";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
      <SoftGlow variant="hero" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren(0.12)}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.span
          variants={fadeRise}
          className="glass mb-8 inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-xs font-medium text-text-secondary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-aurora-teal animate-glow-pulse" />
          Rtu (ऋतु) — Sanskrit term for a recurring cycle
        </motion.span>

        <motion.h1
          variants={fadeRise}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl md:text-7xl"
        >
          Know your body&rsquo;s
          <br />
          <span className="aurora-text">next move.</span>
        </motion.h1>

        <motion.p
          variants={fadeRise}
          className="mt-5 max-w-xl text-balance font-normal text-base text-text-tertiary"
        >
          For that time of the month — and every quiet day in between.
        </motion.p>

        <motion.p
          variants={fadeRise}
          className="mt-3 max-w-xl text-balance text-lg text-text-secondary"
        >
          Rtu turns your logged cycles into precise predictions — next period,
          fertile window, phase — rendered in an interface as gentle as it is smart.
        </motion.p>

        <motion.div variants={fadeRise} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">
              Start tracking
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
          <Button size="lg" variant="glass" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-text-tertiary"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      >
        Scroll
      </motion.div>
    </section>
  );
}

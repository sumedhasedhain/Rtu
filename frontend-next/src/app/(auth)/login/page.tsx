"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { isAxiosError } from "axios";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { fadeRise } from "@/lib/motion/variants";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : "Incorrect email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeRise}>
      <GlassPanel className="p-8 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Welcome back</h1>
        <p className="mt-1.5 text-sm text-text-secondary">Sign in to see your dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {error && (
            <div className="rounded-md border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-state-danger">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
            Sign in
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Don&rsquo;t have an account?{" "}
          <Link href="/register" className="font-medium text-aurora-teal hover:underline">
            Register
          </Link>
        </p>

        <Button variant="glass" size="sm" asChild className="mt-6 w-full">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </GlassPanel>
    </motion.div>
  );
}

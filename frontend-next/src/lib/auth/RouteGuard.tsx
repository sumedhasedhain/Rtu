"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "./useAuth";

/** Client-side auth gate for the `(app)` route group — Next layouts can't declaratively
 * redirect the way React Router's <Navigate> can inside an <Outlet>, so this renders a
 * loading state until auth resolves, then imperatively pushes to /login if unauthenticated. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-aurora-rose/15 border-t-aurora-teal"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
      </div>
    );
  }

  return <>{children}</>;
}

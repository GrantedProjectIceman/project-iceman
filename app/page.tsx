"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [reveal, setReveal] = useState(false);

  // Reveal text after logo assembles
  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 950);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-purple-200/50 blur-3xl" />

      {/* subtle grain (optional vibe) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left: content */}
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={reveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
                ✨ Funding, simplified
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Swipe to decide
              </div>

              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                GRANTED
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  Funding? Granted.
                </span>
              </h1>

              <p className="mt-4 text-gray-600 leading-relaxed">
                Discover grants tailored to your NPO. Swipe through matches, save the best ones,
                and move faster from idea to funding.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/onboarding")}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                >
                  Get Started →
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/match")}
                  className="rounded-xl border border-white/70 bg-white/70 px-6 py-3 font-semibold text-gray-800 shadow-sm backdrop-blur hover:bg-white transition"
                >
                  Try Demo
                </motion.button>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                Tip: Your profile improves match accuracy.
              </div>
            </motion.div>
          </div>

          {/* Right: logo assemble */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative h-[260px] w-[260px]">
              {/* Glass plate behind logo */}
              <div className="absolute inset-0 rounded-3xl bg-white/55 border border-white/70 shadow-xl backdrop-blur" />

              {/* coin */}
              <motion.div
                initial={{ y: -60, opacity: 0, rotate: -25, scale: 0.85 }}
                animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.15 }}
                className="absolute left-1/2 top-[62px] -translate-x-1/2"
              >
                <Image
                  src="/logo-coin.png"
                  alt="Coin"
                  width={72}
                  height={72}
                  priority
                />
              </motion.div>

              {/* left hand */}
              <motion.div
                initial={{ x: -90, y: 30, opacity: 0, rotate: -12, scale: 0.9 }}
                animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.25 }}
                className="absolute left-[32px] top-[92px]"
              >
                <Image
                  src="/logo-hand-left.png"
                  alt="Left hand"
                  width={92}
                  height={92}
                  priority
                />
              </motion.div>

              {/* right hand */}
              <motion.div
                initial={{ x: 90, y: 30, opacity: 0, rotate: 12, scale: 0.9 }}
                animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.25 }}
                className="absolute right-[32px] top-[92px]"
              >
                <Image
                  src="/logo-hand-right.png"
                  alt="Right hand"
                  width={92}
                  height={92}
                  priority
                />
              </motion.div>

              {/* optional: little sparkle ping */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.05, 0.9] }}
                transition={{ duration: 0.9, delay: 0.6 }}
                className="pointer-events-none absolute right-8 top-10 text-xl"
              >
                ✨
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

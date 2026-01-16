// 

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-200 blur-3xl opacity-50" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-200 blur-3xl opacity-50" />

      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-sm text-indigo-700 shadow-sm backdrop-blur"
          >
            ✨ Discover funding opportunities faster
          </motion.div>

          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Grant Matcher
          </h1>

          <p className="mt-4 text-base md:text-lg text-gray-600">
            Swipe through grants curated for your NPO. Filter by issue areas, funding quantum,
            deadlines, and eligibility — then save what matters.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/match">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
              >
                Start Swiping →
              </motion.button>
            </Link>

            <Link href="match">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto rounded-xl border-2 border-indigo-200 bg-white/80 px-6 py-3 font-semibold text-indigo-700 hover:bg-white transition backdrop-blur"
              >
                Explore Filters
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          {[
            { title: "Swipe UX", desc: "Fast decision-making — save grants you like in one tap." },
            { title: "Smart Filters", desc: "Issue area, funding range, deadline window, eligibility." },
            { title: "Track Progress", desc: "See how many saved + remaining at a glance." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur"
            >
              <div className="text-lg font-bold text-gray-900">{f.title}</div>
              <div className="mt-2 text-sm text-gray-600">{f.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

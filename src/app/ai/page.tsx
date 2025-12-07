// src/app/ai/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Layout, Zap } from "lucide-react";
import { AuthGate } from "@/components/dev-auth-gate";

import { HeroClockAvatar } from "./components/HeroClockAvatar";
import { FloatingParticles } from "./components/FloatingParticles";
import { VolumetricLight } from "./components/VolumetricLight";
import { ChatClockAvatar } from "./components/ChatClockAvatar";

export default function AiWorkspaceLandingPage() {
  return (
    <AuthGate>
      <div className="relative min-h-screen overflow-hidden bg-[#050815]">
        {/* Multi-layer atmospheric background */}
        <div className="fixed inset-0">
          {/* Deep indigo base */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #0A0E1A 0%, #1A1F2B 50%, #0C101C 100%)",
            }}
          />

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />

          {/* Atmospheric glow - top */}
          <div
            className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, #2C6DF9 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          {/* Atmospheric glow - bottom right */}
          <div
            className="absolute bottom-0 right-0 h-[500px] w-[600px] opacity-15"
            style={{
              background:
                "radial-gradient(ellipse at center, #7C3AED 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />

          {/* Slate tint - bottom */}
          <div
            className="absolute bottom-0 left-0 h-[400px] w-full opacity-10"
            style={{
              background: "linear-gradient(to top, #94A3B8, transparent)",
              filter: "blur(60px)",
            }}
          />
        </div>

        {/* Volumetric light + floating particles */}
        <VolumetricLight />
        <FloatingParticles />

        {/* Main content */}
        <div className="relative mx-auto max-w-[1400px] px-8 py-20">
          {/* Hero Section */}
          <div className="relative mb-16">
            <div
              className="group relative overflow-hidden rounded-[32px] border border-white/10 p-16 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
            >
              {/* Diagonal grid pattern */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #2C6DF9 1px, transparent 1px), linear-gradient(-45deg, #2C6DF9 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Gradient glow accent */}
              <div
                className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-20"
                style={{
                  background:
                    "radial-gradient(circle, #4F46E5 0%, #7C3AED 50%, transparent 70%)",
                  filter: "blur(60px)",
                }}
              />

              <div className="relative flex items-start justify-between gap-12">
                {/* Left: content */}
                <div className="flex-1">
                  {/* Status badges */}
                  <div className="mb-8 flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2C6DF9] to-[#4F46E5] opacity-30 blur-xl" />
                      <div className="relative inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-5 py-2 backdrop-blur-xl">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                        <span className="bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                          AI Workspace Active
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
                      <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                      <span className="text-slate-300">
                        Powered by Intime Intelligence
                      </span>
                    </div>
                  </div>

                  {/* Hero title & copy */}
                  <h1 className="mb-6 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    Your{" "}
                    <span className="bg-gradient-to-r from-[#2C6DF9] to-[#4F46E5] bg-clip-text text-transparent">
                      time-aware AI
                    </span>{" "}
                    for hiring, people, and planning.
                  </h1>

                  <p className="mb-10 max-w-[580px] text-sm leading-relaxed text-slate-300">
                    Navigate complex workforce decisions with AI that understands
                    context, timing, and organizational dynamics. Strategic
                    planning and instant answers—unified in one intelligent
                    workspace.
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href="/dashboard"
                      className="group/btn inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium text-white backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to dashboard
                    </Link>

                    <Link
                      href="/ai/workspace"
                      className="group/glow relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3 text-xs font-semibold text-white shadow-2xl transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]"
                      style={{
                        background:
                          "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)",
                      }}
                    >
                      {/* Shimmer */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover/glow:opacity-100"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                          animation: "shimmer 2s infinite",
                        }}
                      />
                      <span className="relative">Open AI Workspace</span>
                      <Sparkles className="relative h-4 w-4 animate-pulse" />
                    </Link>
                  </div>
                </div>

                {/* Right: hero avatar */}
                <div className="relative">
                  <HeroClockAvatar />
                </div>
              </div>
            </div>
          </div>

          {/* Feature row */}
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* Strategic workspace card */}
            <div
              className="group relative overflow-hidden rounded-[28px] border border-white/10 p-10 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(79,70,229,0.3)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              }}
            >
              {/* Glow */}
              <div
                className="pointer-events-none absolute left-0 top-0 h-full w-64 opacity-20 transition-opacity group-hover:opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse at left, #4F46E5 0%, #7C3AED 50%, transparent 70%)",
                  filter: "blur(60px)",
                }}
              />

              {/* Floating shapes */}
              <div className="pointer-events-none absolute right-8 top-8 opacity-[0.04]">
                <div className="relative h-40 w-40">
                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-indigo-400 opacity-40"
                    style={{ transform: "rotate(15deg)" }}
                  />
                  <div
                    className="absolute inset-4 rounded-xl border-2 border-purple-400 opacity-60"
                    style={{ transform: "rotate(-10deg)" }}
                  />
                  <div
                    className="absolute inset-8 rounded-lg border-2 border-blue-400 opacity-80"
                    style={{ transform: "rotate(25deg)" }}
                  />
                </div>
              </div>

              <div className="relative">
                {/* Icon */}
                <div
                  className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(124,58,237,0.2) 100%)",
                    border: "1px solid rgba(79,70,229,0.3)",
                  }}
                >
                  <Layout className="h-8 w-8 text-indigo-300" />
                </div>

                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-1.5 backdrop-blur-xl">
                  <Zap className="h-3.5 w-3.5 text-indigo-300" />
                  <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    Workspace
                  </span>
                </div>

                <h2 className="mb-5 mt-6 text-lg font-semibold text-white">
                  Strategic AI Workspace
                </h2>

                <p className="mb-8 text-sm leading-relaxed text-slate-300">
                  Think, plan, and explore strategic decisions with an AI that
                  understands your workforce. Model complex scenarios, draft
                  intelligent policies, and collaborate on initiatives with full
                  organizational context at your fingertips.
                </p>

                <Link
                  href="/ai/workspace"
                  className="group/link inline-flex items-center gap-2 text-sm text-indigo-300 transition-all hover:text-indigo-200"
                >
                  <span>Go to workspace</span>
                  <span className="transition-transform group-hover/link:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Chat card */}
            <div
              className="group relative overflow-hidden rounded-[28px] border border-white/10 p-10 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(44,109,249,0.3)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              }}
            >
              {/* Blue glow */}
              <div
                className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-15 transition-opacity group-hover:opacity-25"
                style={{
                  background:
                    "radial-gradient(circle, #2C6DF9 0%, transparent 70%)",
                  filter: "blur(50px)",
                }}
              />

              {/* Thought bubble motif */}
              <div className="pointer-events-none absolute right-6 top-6 opacity-[0.05]">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle
                    cx="50"
                    cy="30"
                    r="25"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle
                    cx="30"
                    cy="50"
                    r="12"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle cx="20" cy="65" r="6" fill="white" />
                </svg>
              </div>

              <div className="relative">
                {/* Clock avatar */}
                <div className="mb-8">
                  <ChatClockAvatar />
                </div>

                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-4 py-1.5 backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-300" />
                  <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    Ask Intime
                  </span>
                </div>

                <h2 className="mb-5 mt-6 text-lg font-semibold text-white">
                  Chat with Intime
                </h2>

                <p className="mb-8 text-sm leading-relaxed text-slate-300">
                  Instant answers. Always contextual. Always time-aware. Ask
                  about hiring, policies, reviews, or planning—and get grounded
                  responses in sync with your organization.
                </p>

                <Link
                  href="/ai/workspace?view=chat"
                  className="group/link inline-flex items-center gap-2 text-sm text-blue-300 transition-all hover:text-blue-200"
                >
                  <span>Start a new conversation</span>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span className="transition-transform group-hover/link:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Global keyframes for shimmer */}
        <style>{`
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </AuthGate>
  );
}

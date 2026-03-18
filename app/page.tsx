"use client";
import { useState } from "react";
import Link from "next/link";
import { FilePen, PackageSearch, ShieldCheck, Accessibility, Languages } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Lang = "en" | "st";

const t = {
  en: {
    officialBadge: "Official Government Portal",
    heroTitle: "National Identity Registration Portal",
    heroSub: "Apply for, renew, or replace your Lesotho National ID card quickly, securely, and from the comfort of your home.",
    applyBtn: "Apply for ID",
    trackBtn: "Track Application",
    whyTitle: "Why Use This Portal?",
    features: [
      { title: "Apply Online",     desc: "Submit your national ID application from anywhere, anytime." },
      { title: "Track Status",     desc: "Check your application progress in real time using your reference number." },
      { title: "Secure & Private", desc: "Your personal data is encrypted and protected at every step." },
      { title: "Accessible",       desc: "Designed for all citizens including those with visual, motor, or cognitive disabilities." },
    ],
    howTitle: "How It Works",
    steps: [
      { label: "Create Account",    desc: "Register with your email and basic details." },
      { label: "Fill Application",  desc: "Complete the online ID registration form." },
      { label: "Submit Documents",  desc: "Upload required supporting documents." },
      { label: "Track & Collect",   desc: "Monitor your application and collect your ID when ready." },
    ],
    ctaTitle: "Ready to get started?",
    ctaSub:   "Apply for your National ID online today. No queues. No paperwork.",
    ctaBtn:   "Start Application",
    langLabel: "Sesotho",
  },
  st: {
    officialBadge: "Sebaka sa Mmuso sa Molao",
    heroTitle: "Sebaka sa Ngodiso ea Boitsebiso ba Naha",
    heroSub: "Etsa kopo ea karete ea boitsebiso ba Lesotho ka potlako, ka ts'ireletso, le ho tsoa hae ha hao.",
    applyBtn: "Etsa Kopo ea ID",
    trackBtn: "Latela Kopo",
    whyTitle: "Ke Hobane'ng o Sebelise Sebaka Sena?",
    features: [
      { title: "Etsa Kopo Inthaneteng", desc: "Romela kopo ea hao ea ID ho tsoa hohle, nako efe kapa efe." },
      { title: "Latela Boemo",          desc: "Hlahloba tsoelo-pele ea kopo ea hao ka nako ea nnete." },
      { title: "Ts'ireletso le Lekunutu", desc: "Lintlha tsa hao tsa botho li sireletsehile le ho bolokoa mohato o mong le o mong." },
      { title: "E Fumaneha ke Bohle",   desc: "E entsoe bakeng sa baahi bohle ho kenyelletsa ba nang le bokooa ba pono, motsamao kapa kelello." },
    ],
    howTitle: "E Sebetsa Joang",
    steps: [
      { label: "Theha Akhaonto",       desc: "Ngodisa ka imeile ea hao le lintlha tsa motheo." },
      { label: "Tlatsa Foromo",        desc: "Phethela foromo ea ngodiso ea ID inthaneteng." },
      { label: "Romela Litokomane",    desc: "Kenya litokomane tse hlokahalang." },
      { label: "Latela le ho Kga",     desc: "Hlahloba kopo ea hao ebe o kga ID ea hao ha e se e le teng." },
    ],
    ctaTitle: "U Itokiselitse ho Qala?",
    ctaSub:   "Etsa kopo ea ID ea Naha inthaneteng kajeno. Ha ho marapo. Ha ho pepa.",
    ctaBtn:   "Qala Kopo",
    langLabel: "English",
  },
};

const icons = [FilePen, PackageSearch, ShieldCheck, Accessibility];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const c = t[lang];

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="bg-[#003580] text-white py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Language toggle */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setLang(lang === "en" ? "st" : "en")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                aria-label={`Switch to ${c.langLabel}`}
              >
                <Languages className="w-4 h-4" aria-hidden="true" />
                {c.langLabel}
              </button>
            </div>

            <div className="inline-block bg-[#009A44] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {c.officialBadge}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {c.heroTitle}
            </h1>
            <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
              {c.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-[#009A44] hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                {c.applyBtn}
              </Link>
              <Link href="/track" className="bg-white text-[#003580] hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-colors">
                {c.trackBtn}
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="features-heading" className="text-2xl font-bold text-center text-[#003580] mb-10">
              {c.whyTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.features.map(({ title, desc }, i) => {
                const Icon = icons[i];
                return (
                  <div key={title} className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-3">
                      <Icon className="w-10 h-10 text-[#003580]" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-[#003580] mb-2">{title}</h3>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 bg-gray-50" aria-labelledby="steps-heading">
          <div className="max-w-4xl mx-auto">
            <h2 id="steps-heading" className="text-2xl font-bold text-center text-[#003580] mb-10">
              {c.howTitle}
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
              {c.steps.map(({ label, desc }, i) => (
                <li key={label} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#003580] text-white font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#009A44] text-white py-14 px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">{c.ctaTitle}</h2>
          <p className="text-green-100 mb-6">{c.ctaSub}</p>
          <Link href="/register" className="bg-white text-[#009A44] font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors">
            {c.ctaBtn}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/track", label: "Track Application" },
  { href: "/login", label: "My Account" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#003580] text-white shadow-md">
      {/* Top bar */}
      <div className="bg-[#009A44] text-white text-xs text-center py-1 px-4">
        Official Portal of the Ministry of Home Affairs – Kingdom of Lesotho
      </div>

      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-white">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-[#003580] font-bold text-sm">LS</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm">Ministry of Home Affairs</p>
            <p className="text-xs text-blue-200">Kingdom of Lesotho</p>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-white text-[#003580]"
                    : "hover:bg-blue-700 text-white"
                }`}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/staff/login"
              className="ml-2 px-4 py-2 rounded text-sm font-medium bg-[#009A44] hover:bg-green-700 transition-colors"
            >
              Staff Portal
            </Link>
          </li>
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded hover:bg-blue-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <ul id="mobile-menu" className="md:hidden bg-blue-900 px-4 pb-4 flex flex-col gap-1" role="list">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block px-3 py-2 rounded text-sm text-white hover:bg-blue-700"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/staff/login" className="block px-3 py-2 rounded text-sm text-white bg-[#009A44] hover:bg-green-700" onClick={() => setMenuOpen(false)}>
              Staff Portal
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}

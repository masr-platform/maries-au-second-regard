'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-white/70 hover:text-white p-2 transition-colors"
        aria-label="Menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#060412] border-b border-purple-500/20 py-4 px-6 flex flex-col gap-4">
          <Link href="/tarifs" onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-base font-medium transition-colors py-1">
            Tarifs
          </Link>
          <Link href="/faq" onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-base font-medium transition-colors py-1">
            FAQ
          </Link>
          <Link href="/connexion" onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-base font-medium transition-colors py-1">
            Connexion
          </Link>
          <Link href="/inscription" onClick={() => setOpen(false)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-full text-sm font-bold transition-all text-center mt-1">
            Commencer gratuitement →
          </Link>
        </div>
      )}
    </div>
  )
}

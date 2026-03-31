'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface Question {
  q: string
  a: string
}

export default function FAQClient({ questions }: { questions: Question[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {questions.map((faq, i) => (
        <div key={i} className="border border-purple-500/15 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-950/20 to-fuchsia-950/10 hover:border-purple-500/30 transition-colors">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex justify-between items-center p-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-white font-medium pr-4 text-sm md:text-base">{faq.q}</span>
            <ChevronDown
              size={18}
              className={`text-purple-400 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

export function ActionSheet({ open, onClose, onSelect }) {
  const { t } = useApp()
  const a = t.action

  const items = [
    { id: 'enviar', icon: '↑', label: a.enviar, sub: a.enviarSub },
    { id: 'recibir', icon: '↓', label: a.recibir, sub: a.recibirSub },
    { id: 'swap', icon: '⇄', label: a.swap, sub: a.swapSub },
  ]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-[430px] bg-bg-elevated rounded-t-3xl px-6 pb-8 pt-4"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="w-12 h-1 bg-border-color rounded-full mx-auto mb-6" />
            <p className="text-text-primary font-semibold text-lg mb-4">{a.queQueres}</p>
            <div className="space-y-3">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); onClose() }}
                  className="w-full flex items-center gap-4 p-4 bg-bg-card rounded-2xl border border-border-color hover:border-teal transition-colors text-left"
                >
                  <span className="text-teal text-2xl w-8 text-center">{item.icon}</span>
                  <div>
                    <p className="text-text-primary font-medium">{item.label}</p>
                    <p className="text-text-muted text-sm">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={onClose} className="mt-4 w-full py-3 text-text-muted text-sm">
              {a.cancelar}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

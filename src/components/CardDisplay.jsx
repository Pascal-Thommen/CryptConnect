import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { Modal } from './Modal.jsx'
import { Icon } from './Icons.jsx'

export function CardDisplay({ card }) {
  const { t } = useApp()
  const [showDetails, setShowDetails] = useState(false)
  const [flipped, setFlipped] = useState(false)

  const last4 = card.numero.slice(-4)
  const masked = `•••• •••• •••• ${last4}`

  return (
    <>
      <div
        className="relative flex-shrink-0 w-72 h-44 rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
            style={{
              background: card.fisica
                ? 'linear-gradient(135deg, #0F2040 0%, #1B3A5C 60%, #2EC4A9 160%)'
                : 'linear-gradient(135deg, rgba(15,32,64,0.95) 0%, rgba(27,58,92,0.8) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              backfaceVisibility: 'hidden',
            }}
          >
            {card.fisica === false && (
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
                <span className="text-teal text-2xl font-black tracking-[0.4em] uppercase">Virtual</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <img
                src="./logo-white.png"
                alt="CriptConnect"
                className="h-6 object-contain"
                onError={e => { e.target.style.display='none' }}
              />
              <span className="text-text-secondary/70 text-xs font-semibold tracking-widest">VISA</span>
            </div>
            <div>
              <p className="text-text-primary font-mono text-base tracking-widest tabular-nums">{masked}</p>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-text-muted text-[9px] uppercase tracking-wider">Titular</p>
                  <p className="text-text-primary text-sm font-medium">Ana García</p>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-[9px] uppercase tracking-wider">Vence</p>
                  <p className="text-text-primary text-sm font-mono">{card.vencimiento}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #0F2040, #1B3A5C)',
              border: '1px solid rgba(255,255,255,0.07)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="w-full h-8 bg-bg-primary/80 rounded" />
            <div className="flex items-center justify-end gap-3">
              <div className="flex-1 h-5 bg-bg-primary/40 rounded" />
              <span className="text-text-primary font-mono text-sm">CVV: {card.cvv}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 mt-2 w-72 flex-shrink-0">
        <button
          onClick={() => setShowDetails(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border-color text-text-secondary text-xs font-medium hover:border-teal/60 hover:text-teal transition-colors"
        >
          <Icon name="invoice" size={13} />
          {t.cuenta.verDatos}
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border-color text-text-secondary text-xs font-medium hover:border-red/40 hover:text-red transition-colors">
          <Icon name="lock" size={13} />
          {t.cuenta.bloquear}
        </button>
      </div>

      <Modal open={showDetails} onClose={() => setShowDetails(false)}>
        <h3 className="text-text-primary font-semibold mb-5">Detalles de tarjeta</h3>
        <div className="space-y-0.5">
          {[
            { label: 'Número', value: card.numero },
            { label: 'Vencimiento', value: card.vencimiento },
            { label: 'CVV', value: card.cvv },
            { label: 'Titular', value: 'Ana García' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-3 border-b border-border-color/50">
              <span className="text-text-muted text-sm">{row.label}</span>
              <span className="text-text-primary font-mono text-sm">{row.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setShowDetails(false)} className="mt-5 w-full py-3 bg-bg-card border border-border-color rounded-xl text-text-secondary text-sm">
          {t.common.cerrar}
        </button>
      </Modal>
    </>
  )
}

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { Modal } from './Modal.jsx'

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
          transition={{ duration: 0.5 }}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
            style={{
              background: card.fisica
                ? 'linear-gradient(135deg, #0F2040 0%, #1B3A5C 50%, #2EC4A9 100%)'
                : 'linear-gradient(135deg, rgba(15,32,64,0.9) 0%, rgba(46,196,169,0.15) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              backfaceVisibility: 'hidden',
            }}
          >
            {card.fisica === false && (
              <div className="absolute inset-0 flex items-center justify-center opacity-10 text-2xl font-bold tracking-[0.3em] text-teal pointer-events-none">
                VIRTUAL
              </div>
            )}
            <div className="flex justify-between items-start">
              <img src="./logo-white.png" alt="CriptConnect" className="h-6 object-contain" onError={e => { e.target.style.display='none' }} />
              <span className="text-text-secondary text-xs font-medium">VISA</span>
            </div>
            <div>
              <p className="text-text-primary font-mono text-base tracking-widest tabular-nums">{masked}</p>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-text-muted text-[10px] uppercase tracking-wider">Titular</p>
                  <p className="text-text-primary text-sm font-medium">Ana García</p>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider">Vence</p>
                  <p className="text-text-primary text-sm">{card.vencimiento}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #0F2040, #1B3A5C)',
              border: '1px solid rgba(255,255,255,0.08)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="w-full h-8 bg-bg-primary/80 rounded" />
            <div className="flex items-center justify-end gap-2">
              <div className="flex-1 h-6 bg-bg-primary/40 rounded" />
              <span className="text-text-primary font-mono text-sm">CVV: {card.cvv}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 mt-2 w-72 flex-shrink-0">
        <button
          onClick={() => setShowDetails(true)}
          className="flex-1 py-2 rounded-xl border border-border-color text-text-secondary text-xs font-medium hover:border-teal hover:text-teal transition-colors"
        >
          👁 {t.cuenta.verDatos}
        </button>
        <button className="flex-1 py-2 rounded-xl border border-border-color text-text-secondary text-xs font-medium hover:border-red hover:text-red transition-colors">
          ❄️ {t.cuenta.bloquear}
        </button>
      </div>

      <Modal open={showDetails} onClose={() => setShowDetails(false)}>
        <h3 className="text-text-primary font-semibold mb-4">Detalles de tarjeta</h3>
        <div className="space-y-3">
          <Row label="Número" value={card.numero} />
          <Row label="Vencimiento" value={card.vencimiento} />
          <Row label="CVV" value={card.cvv} />
          <Row label="Titular" value="Ana García" />
        </div>
        <button onClick={() => setShowDetails(false)} className="mt-6 w-full py-3 bg-bg-card border border-border-color rounded-xl text-text-secondary text-sm">
          {t.common.cerrar}
        </button>
      </Modal>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border-color/50">
      <span className="text-text-muted text-sm">{label}</span>
      <span className="text-text-primary font-mono text-sm">{value}</span>
    </div>
  )
}

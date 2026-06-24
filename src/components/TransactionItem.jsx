import React from 'react'
import { formatPYG, shortDate } from '../utils/formatters.js'

const iconMap = {
  recibido: { icon: '↓', color: 'text-green', bg: 'bg-green/10' },
  enviado: { icon: '↑', color: 'text-red', bg: 'bg-red/10' },
  pago: { icon: '🧾', color: 'text-gold', bg: 'bg-gold/10' },
  swap: { icon: '⇄', color: 'text-teal', bg: 'bg-teal/10' },
  'compra-xstock': { icon: '📈', color: 'text-teal', bg: 'bg-teal/10' },
}

function formatTxAmount(tx) {
  const { tipo, asset, monto } = tx
  if (asset === 'fiat' || asset === 'BTC→fiat') {
    return { text: formatPYG(Math.abs(monto)), positive: monto > 0 }
  }
  if (tipo === 'recibido' || tipo === 'enviado') {
    return { text: `${Math.abs(monto)} ${asset}`, positive: tipo === 'recibido' }
  }
  if (tipo === 'swap') {
    return { text: `${tx.montoOrigen} ${asset.split('→')[0]} → ${monto} ${asset.split('→')[1]}`, positive: true }
  }
  return { text: formatPYG(Math.abs(monto)), positive: monto > 0 }
}

export function TransactionItem({ tx }) {
  const style = iconMap[tx.tipo] || { icon: '•', color: 'text-text-secondary', bg: 'bg-bg-elevated' }
  const { text, positive } = formatTxAmount(tx)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border-color/50 last:border-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${style.bg}`}>
        <span className={style.color}>{style.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{tx.descripcion}</p>
        <p className="text-text-muted text-xs">{shortDate(tx.fecha)}</p>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${positive ? 'text-green' : 'text-red'}`}>
        {positive ? '+' : ''}{text}
      </span>
    </div>
  )
}

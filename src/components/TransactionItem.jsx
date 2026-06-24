import React from 'react'
import { Icon } from './Icons.jsx'
import { formatPYG, shortDate } from '../utils/formatters.js'

const typeConfig = {
  recibido:       { icon: 'arrowDown', color: 'text-green',         bg: 'bg-green/10' },
  enviado:        { icon: 'arrowUp',   color: 'text-red',           bg: 'bg-red/10' },
  pago:           { icon: 'services',  color: 'text-text-secondary', bg: 'bg-bg-elevated' },
  swap:           { icon: 'swap',      color: 'text-teal',           bg: 'bg-teal/10' },
  'compra-xstock':{ icon: 'trendUp',   color: 'text-teal',           bg: 'bg-teal/10' },
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
    return { text: `${tx.montoOrigen} ${asset.split('→')[0]}`, positive: false }
  }
  return { text: formatPYG(Math.abs(monto)), positive: monto > 0 }
}

export function TransactionItem({ tx }) {
  const style = typeConfig[tx.tipo] || { icon: 'chevronRight', color: 'text-text-secondary', bg: 'bg-bg-elevated' }
  const { text, positive } = formatTxAmount(tx)

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-border-color/40 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
        <Icon name={style.icon} size={16} className={style.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{tx.descripcion}</p>
        <p className="text-text-muted text-xs mt-0.5">{shortDate(tx.fecha)}</p>
      </div>
      <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${positive ? 'text-green' : 'text-text-secondary'}`}>
        {positive ? '+' : ''}{text}
      </span>
    </div>
  )
}

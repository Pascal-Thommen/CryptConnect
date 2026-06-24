export function formatPYG(amount) {
  return `₲ ${Math.round(amount).toLocaleString('es-PY')}`
}

export function formatCrypto(amount, symbol) {
  if (symbol === 'BTC') return `${Number(amount).toFixed(8)} BTC`
  if (symbol === 'ETH') return `${Number(amount).toFixed(4)} ETH`
  return `${Number(amount).toFixed(2)} ${symbol}`
}

export function formatPercent(pct) {
  if (pct == null) return '—'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${Number(pct).toFixed(2)}%`
}

export function formatUSD(amount) {
  return `USD ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function shortDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })
}

export function fullDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })
}

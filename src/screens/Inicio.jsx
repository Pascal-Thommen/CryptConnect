import React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { useAutoYield } from '../hooks/useAutoYield.js'
import { TransactionItem } from '../components/TransactionItem.jsx'
import { Icon } from '../components/Icons.jsx'
import { formatPYG, formatPercent } from '../utils/formatters.js'

function getGreeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t.inicio.greeting_morning
  if (h < 19) return t.inicio.greeting_afternoon
  return t.inicio.greeting_evening
}

function getTodayStr(lang) {
  return new Date().toLocaleDateString(lang === 'es' ? 'es-PY' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

function AssetCard({ label, symbol, valuePYG, change24h }) {
  const isPos = change24h == null ? null : change24h >= 0
  return (
    <div className="flex-shrink-0 w-36 bg-bg-card border border-border-color rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-xs font-medium truncate">{label}</span>
        {symbol && (
          <span className="text-[10px] font-bold text-text-muted/60 ml-1 flex-shrink-0">{symbol}</span>
        )}
      </div>
      <p className="text-text-primary font-semibold text-sm tabular-nums">{formatPYG(valuePYG)}</p>
      {isPos !== null && (
        <div className={`flex items-center gap-1 mt-1.5 ${isPos ? 'text-green' : 'text-red'}`}>
          <Icon name={isPos ? 'trendUp' : 'trendDown'} size={11} />
          <span className="text-xs tabular-nums">{formatPercent(change24h)}</span>
        </div>
      )}
    </div>
  )
}

export function Inicio({ onAction }) {
  const { t, language, user, cuenta, cryptoHoldings, xstockHoldings, xstockPrices, transactions, livePrices, usdToPyg, patrimonioTotal } = useApp()
  const { todayYield, accumulatedYield } = useAutoYield()
  const ti = t.inicio

  const change24h = livePrices.bitcoin?.pyg_24h_change || 0

  const cryptoCards = cryptoHoldings.map(h => ({
    key: h.symbol,
    label: h.name,
    symbol: h.symbol,
    valuePYG: h.amount * (livePrices[h.coingeckoId]?.pyg || 0),
    change24h: livePrices[h.coingeckoId]?.pyg_24h_change,
  }))

  const xCards = xstockHoldings.map(h => ({
    key: h.symbol,
    label: h.name,
    symbol: h.symbol,
    valuePYG: h.shares * (xstockPrices[h.symbol] || h.basePriceUSD) * usdToPyg,
    change24h: ((xstockPrices[h.symbol] || h.basePriceUSD) / h.basePriceUSD - 1) * 100,
  }))

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <img
          src="./logo-white.png"
          alt="CriptConnect"
          className="h-8 object-contain"
          onError={e => { e.target.style.display='none' }}
        />
        <button className="w-9 h-9 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
          <Icon name="bell" size={18} />
        </button>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <p className="text-text-secondary text-sm font-medium">{getGreeting(t)}, {user.name.split(' ')[0]}</p>
        <p className="text-text-muted text-xs capitalize mt-0.5">{getTodayStr(language)}</p>
      </div>

      {/* Patrimonio */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
        <p className="text-text-muted text-[10px] uppercase tracking-[0.1em] mb-1">{ti.patrimonio}</p>
        <motion.p
          className="text-text-primary font-bold tabular-nums"
          style={{ fontSize: 28, letterSpacing: '-0.02em' }}
          key={Math.round(patrimonioTotal / 100000)}
        >
          {formatPYG(patrimonioTotal)}
        </motion.p>
        <div className={`flex items-center gap-1.5 mt-1.5 ${change24h >= 0 ? 'text-green' : 'text-red'}`}>
          <Icon name={change24h >= 0 ? 'trendUp' : 'trendDown'} size={13} />
          <span className="text-sm tabular-nums">{formatPercent(change24h)} {ti.hoy}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-around px-5 mb-6">
        {[
          { id: 'enviar', icon: 'send', label: ti.transferir },
          { id: 'recibir', icon: 'qr', label: ti.pagar },
          { id: 'recibir', icon: 'receive', label: ti.recibir },
        ].map((a, i) => (
          <button key={i} onClick={() => onAction(a.id)} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-teal transition-colors hover:border-teal/50">
              <Icon name={a.icon} size={20} className="text-teal" />
            </div>
            <span className="text-text-muted text-xs">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Asset Cards */}
      <div className="mb-5">
        <p className="text-text-secondary text-sm font-medium px-5 mb-3">{ti.misActivos}</p>
        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide pb-1">
          <AssetCard label="Guaraníes" symbol="PYG" valuePYG={cuenta.saldo} change24h={null} />
          {cryptoCards.map(c => <AssetCard key={c.key} label={c.label} symbol={c.symbol} valuePYG={c.valuePYG} change24h={c.change24h} />)}
          {xCards.map(c => <AssetCard key={c.key} label={c.label} symbol={c.symbol} valuePYG={c.valuePYG} change24h={c.change24h} />)}
        </div>
      </div>

      {/* Auto-Yield */}
      <div className="mx-5 mb-5 bg-bg-card border border-teal/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse flex-shrink-0" />
          <p className="text-text-primary font-medium text-sm">{ti.autoYield}</p>
          <span className="ml-auto text-text-muted text-xs font-medium">3% APY</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-text-muted text-[10px] uppercase tracking-wider">{ti.ganandoHoy}</p>
            <p className="text-green font-semibold tabular-nums text-sm mt-0.5">{formatPYG(todayYield)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-[10px] uppercase tracking-wider">{ti.acumulado}</p>
            <p className="text-teal font-semibold tabular-nums text-sm mt-0.5">{formatPYG(accumulatedYield)}</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-secondary text-sm font-medium">{ti.ultimas}</p>
          <button className="flex items-center gap-1 text-teal text-xs font-medium">
            {ti.verTodo}
            <Icon name="chevronRight" size={12} />
          </button>
        </div>
        <div className="bg-bg-card border border-border-color rounded-2xl px-4">
          {transactions.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}
        </div>
      </div>
    </div>
  )
}

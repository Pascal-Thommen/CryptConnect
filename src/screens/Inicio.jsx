import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { useAutoYield } from '../hooks/useAutoYield.js'
import { TransactionItem } from '../components/TransactionItem.jsx'
import { formatPYG, formatPercent, formatCrypto } from '../utils/formatters.js'

function getGreeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t.inicio.greeting_morning
  if (h < 19) return t.inicio.greeting_afternoon
  return t.inicio.greeting_evening
}

function getTodayEs() {
  return new Date().toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })
}

function AssetCard({ label, icon, valuePYG, change24h }) {
  const isPos = change24h >= 0
  return (
    <div className="flex-shrink-0 w-36 bg-bg-card border border-border-color rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-teal text-lg">{icon}</span>
        <span className="text-text-muted text-xs truncate">{label}</span>
      </div>
      <p className="text-text-primary font-semibold text-sm tabular-nums">{formatPYG(valuePYG)}</p>
      {change24h != null && (
        <p className={`text-xs mt-1 ${isPos ? 'text-green' : 'text-red'}`}>
          {formatPercent(change24h)} {isPos ? '📈' : '📉'}
        </p>
      )}
    </div>
  )
}

export function Inicio({ onAction }) {
  const { t, user, cuenta, cryptoHoldings, xstockHoldings, xstockPrices, transactions, livePrices, usdToPyg, patrimonioTotal, cryptoTotalPYG } = useApp()
  const { todayYield, accumulatedYield } = useAutoYield()
  const ti = t.inicio

  const change24h = livePrices.bitcoin?.pyg_24h_change || 0

  const cryptoCards = cryptoHoldings.map(h => ({
    symbol: h.symbol,
    label: h.name,
    icon: h.symbol === 'BTC' ? '₿' : h.symbol === 'ETH' ? 'Ξ' : '₮',
    valuePYG: h.amount * (livePrices[h.coingeckoId]?.pyg || 0),
    change24h: livePrices[h.coingeckoId]?.pyg_24h_change,
  }))

  const xCards = xstockHoldings.map(h => ({
    symbol: h.symbol,
    label: h.symbol,
    icon: h.symbol,
    valuePYG: h.shares * (xstockPrices[h.symbol] || h.basePriceUSD) * usdToPyg,
    change24h: (Math.random() - 0.48) * 3,
  }))

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <img src="./logo-white.png" alt="CriptConnect" className="h-8 object-contain" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
        <span className="hidden text-text-primary font-bold text-lg"><span className="text-navy">CRIPT</span><span className="text-teal">CONNECT</span></span>
        <button className="w-10 h-10 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-xl">🔔</button>
      </div>

      {/* Greeting */}
      <div className="px-5 mb-5">
        <p className="text-text-secondary text-sm">{getGreeting(t)}, {user.name.split(' ')[0]} 👋</p>
        <p className="text-text-muted text-xs capitalize">{getTodayEs()}</p>
      </div>

      {/* Patrimonio */}
      <div className="mx-5 mb-5 bg-bg-card border border-border-color rounded-2xl p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
        <p className="text-text-muted text-[11px] uppercase tracking-[0.08em] mb-1">{ti.patrimonio}</p>
        <motion.p
          className="text-text-primary font-bold tabular-nums"
          style={{ fontSize: 30, letterSpacing: '-0.02em' }}
          key={Math.round(patrimonioTotal / 1000)}
        >
          {formatPYG(patrimonioTotal)}
        </motion.p>
        <p className={`text-sm mt-1 ${change24h >= 0 ? 'text-green' : 'text-red'}`}>
          {formatPercent(change24h)} {ti.hoy} {change24h >= 0 ? '🟢' : '🔴'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-around px-5 mb-6">
        {[
          { id: 'enviar', icon: '↑', label: ti.transferir },
          { id: 'recibir', icon: 'QR', label: ti.pagar },
          { id: 'recibir', icon: '↓', label: ti.recibir },
        ].map((a, i) => (
          <button key={i} onClick={() => onAction(a.id)} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-teal text-lg font-medium">
              {a.icon}
            </div>
            <span className="text-text-muted text-xs">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Asset Cards Scroll */}
      <div className="mb-5">
        <p className="text-text-secondary text-sm font-medium px-5 mb-3">{ti.misActivos}</p>
        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide pb-1">
          <AssetCard label="₲ Guaraníes" icon="₲" valuePYG={cuenta.saldo} change24h={null} />
          {cryptoCards.map(c => <AssetCard key={c.symbol} label={c.label} icon={c.icon} valuePYG={c.valuePYG} change24h={c.change24h} />)}
          {xCards.map(c => <AssetCard key={c.symbol} label={c.label} icon={c.icon} valuePYG={c.valuePYG} change24h={c.change24h} />)}
        </div>
      </div>

      {/* Auto-Yield */}
      <div className="mx-5 mb-5 bg-bg-card border border-teal/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <p className="text-text-primary font-medium text-sm">{ti.autoYield}</p>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-text-muted text-xs">{ti.ganandoHoy}</p>
            <p className="text-green font-semibold tabular-nums">{formatPYG(todayYield)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-xs">{ti.acumulado}</p>
            <p className="text-teal font-semibold tabular-nums">{formatPYG(accumulatedYield)}</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-secondary text-sm font-medium">{ti.ultimas}</p>
          <button className="text-teal text-xs">{ti.verTodo} →</button>
        </div>
        <div className="bg-bg-card border border-border-color rounded-2xl px-4">
          {transactions.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}
        </div>
      </div>
    </div>
  )
}

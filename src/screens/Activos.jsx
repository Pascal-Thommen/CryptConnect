import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { formatPYG, formatPercent, formatUSD } from '../utils/formatters.js'

const mockChart = Array.from({ length: 7 }, (_, i) => ({
  day: ['L', 'M', 'X', 'J', 'V', 'S', 'D'][i],
  value: 44000000 + Math.random() * 8000000,
}))

function CryptoRow({ holding, price, change }) {
  const valuePYG = holding.amount * price
  const isPos = change >= 0
  const icons = { BTC: '₿', ETH: 'Ξ', USDT: '₮' }
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-color/50 last:border-0">
      <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal text-lg flex-shrink-0">
        {icons[holding.symbol] || holding.symbol[0]}
      </div>
      <div className="flex-1">
        <p className="text-text-primary font-medium text-sm">{holding.name}</p>
        <p className="text-text-muted text-xs tabular-nums">{holding.amount} {holding.symbol}</p>
        <p className="text-text-muted text-xs tabular-nums">{formatPYG(price)}/{holding.symbol}</p>
      </div>
      <div className="text-right">
        <p className="text-text-primary font-semibold text-sm tabular-nums">{formatPYG(valuePYG)}</p>
        <p className={`text-xs ${isPos ? 'text-green' : 'text-red'}`}>{formatPercent(change)} {isPos ? '📈' : '📉'}</p>
      </div>
    </div>
  )
}

function XStockRow({ holding, currentPrice, usdToPyg }) {
  const pricePYG = currentPrice * usdToPyg
  const valuePYG = holding.shares * pricePYG
  const change = (currentPrice / holding.basePriceUSD - 1) * 100
  const isPos = change >= 0
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-color/50 last:border-0">
      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-text-primary text-xs font-bold flex-shrink-0">
        {holding.symbol}
      </div>
      <div className="flex-1">
        <p className="text-text-primary font-medium text-sm">{holding.name}</p>
        <p className="text-text-muted text-xs">{holding.shares} acciones</p>
        <p className="text-text-muted text-xs tabular-nums">{formatUSD(currentPrice)} → {formatPYG(pricePYG)}/acc</p>
      </div>
      <div className="text-right">
        <p className="text-text-primary font-semibold text-sm tabular-nums">{formatPYG(valuePYG)}</p>
        <p className={`text-xs ${isPos ? 'text-green' : 'text-red'}`}>{formatPercent(change)} {isPos ? '📈' : '📉'}</p>
      </div>
    </div>
  )
}

export function Activos() {
  const { t, cryptoHoldings, xstockHoldings, xstockPrices, livePrices, usdToPyg, cryptoTotalPYG, xstockTotalPYG } = useApp()
  const [tab, setTab] = useState('cripto')
  const ta = t.activos

  const crypto24h = livePrices.bitcoin?.pyg_24h_change || 0

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-5 pt-5 pb-4">
        <div className="flex bg-bg-card border border-border-color rounded-2xl p-1">
          {['cripto', 'xstocks'].map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === s ? 'bg-teal text-bg-primary' : 'text-text-muted'}`}
            >
              {s === 'cripto' ? ta.cripto : ta.xstocks}
            </button>
          ))}
        </div>
      </div>

      {tab === 'cripto' ? (
        <div className="px-5 space-y-4">
          <div className="bg-bg-card border border-border-color rounded-2xl p-5">
            <p className="text-text-muted text-[11px] uppercase tracking-[0.08em]">{ta.portafolioCripto}</p>
            <p className="text-text-primary font-bold text-2xl tabular-nums mt-1">{formatPYG(cryptoTotalPYG)}</p>
            <p className={`text-sm mt-1 ${crypto24h >= 0 ? 'text-green' : 'text-red'}`}>{formatPercent(crypto24h)} 24h</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green" />
              <p className="text-text-muted text-xs">{ta.autoYieldActivo}</p>
            </div>
          </div>

          <div className="bg-bg-card border border-border-color rounded-2xl px-4">
            {cryptoHoldings.map(h => (
              <CryptoRow
                key={h.symbol}
                holding={h}
                price={livePrices[h.coingeckoId]?.pyg || 0}
                change={livePrices[h.coingeckoId]?.pyg_24h_change || 0}
              />
            ))}
          </div>

          <div className="bg-bg-card border border-border-color rounded-2xl p-4">
            <p className="text-text-secondary text-sm font-medium mb-3">{ta.chart7d}</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={mockChart}>
                <XAxis dataKey="day" tick={{ fill: '#3D6080', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#162B50', border: '1px solid #1E3A5A', borderRadius: 8 }}
                  labelStyle={{ color: '#7A9BB5' }}
                  formatter={v => [formatPYG(v), '']}
                />
                <Line type="monotone" dataKey="value" stroke="#2EC4A9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-bg-card border border-border-color rounded-2xl p-4">
            <p className="text-text-muted text-xs text-center">💡 {ta.disponibleComprar}</p>
          </div>
        </div>
      ) : (
        <div className="px-5 space-y-4">
          <div className="bg-bg-card border border-border-color rounded-2xl p-5">
            <p className="text-text-muted text-[11px] uppercase tracking-[0.08em]">{ta.portafolioXStock}</p>
            <p className="text-text-primary font-bold text-2xl tabular-nums mt-1">{formatPYG(xstockTotalPYG)}</p>
            <div className="mt-3">
              <p className="text-gold text-xs">{ta.soloHabiles}</p>
            </div>
          </div>

          <div className="bg-bg-card border border-border-color rounded-2xl px-4">
            {xstockHoldings.map(h => (
              <XStockRow
                key={h.symbol}
                holding={h}
                currentPrice={xstockPrices[h.symbol] || h.basePriceUSD}
                usdToPyg={usdToPyg}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { formatPYG, formatPercent, formatUSD } from '../utils/formatters.js'

const mockChart = Array.from({ length: 7 }, (_, i) => ({
  day: ['L', 'M', 'X', 'J', 'V', 'S', 'D'][i],
  value: 44000000 + Math.random() * 8000000,
}))

function CryptoRow({ holding, price, change }) {
  const valuePYG = holding.amount * price
  const isPos = change >= 0
  const symbols = { BTC: '₿', ETH: 'Ξ', USDT: '₮' }
  return (
    <div className="flex items-center gap-3 py-4 border-b border-border-color/40 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
        <span className="text-teal text-base font-bold">{symbols[holding.symbol] || holding.symbol[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-medium text-sm">{holding.name}</p>
        <p className="text-text-muted text-xs tabular-nums mt-0.5">{holding.amount} {holding.symbol}</p>
        <p className="text-text-muted text-xs tabular-nums">{formatPYG(price)}/{holding.symbol}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-text-primary font-semibold text-sm tabular-nums">{formatPYG(valuePYG)}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${isPos ? 'text-green' : 'text-red'}`}>
          <Icon name={isPos ? 'trendUp' : 'trendDown'} size={11} />
          <span className="text-xs tabular-nums">{formatPercent(change)}</span>
        </div>
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
    <div className="flex items-center gap-3 py-4 border-b border-border-color/40 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-navy border border-border-color flex items-center justify-center flex-shrink-0">
        <span className="text-text-primary text-[11px] font-bold">{holding.symbol}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-medium text-sm">{holding.name}</p>
        <p className="text-text-muted text-xs mt-0.5">{holding.shares} acciones</p>
        <p className="text-text-muted text-xs tabular-nums">{formatUSD(currentPrice)} → {formatPYG(pricePYG)}/acc</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-text-primary font-semibold text-sm tabular-nums">{formatPYG(valuePYG)}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${isPos ? 'text-green' : 'text-red'}`}>
          <Icon name={isPos ? 'trendUp' : 'trendDown'} size={11} />
          <span className="text-xs tabular-nums">{formatPercent(change)}</span>
        </div>
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
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === s ? 'bg-teal text-bg-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              {s === 'cripto' ? ta.cripto : ta.xstocks}
            </button>
          ))}
        </div>
      </div>

      {tab === 'cripto' ? (
        <div className="px-5 space-y-4">
          <div className="bg-bg-card border border-border-color rounded-2xl p-5">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.1em]">{ta.portafolioCripto}</p>
            <p className="text-text-primary font-bold text-2xl tabular-nums mt-1" style={{ letterSpacing: '-0.02em' }}>{formatPYG(cryptoTotalPYG)}</p>
            <div className={`flex items-center gap-1.5 mt-1.5 ${crypto24h >= 0 ? 'text-green' : 'text-red'}`}>
              <Icon name={crypto24h >= 0 ? 'trendUp' : 'trendDown'} size={13} />
              <span className="text-sm tabular-nums">{formatPercent(crypto24h)} 24h</span>
            </div>
            <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border-color/50">
              <div className="w-2 h-2 rounded-full bg-green flex-shrink-0" />
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
                  contentStyle={{ background: '#162B50', border: '1px solid #1E3A5A', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#7A9BB5' }}
                  formatter={v => [formatPYG(v), '']}
                />
                <Line type="monotone" dataKey="value" stroke="#2EC4A9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-bg-card border border-border-color rounded-2xl p-4">
            <p className="text-text-muted text-xs text-center">{ta.disponibleComprar}</p>
          </div>
        </div>
      ) : (
        <div className="px-5 space-y-4">
          <div className="bg-bg-card border border-border-color rounded-2xl p-5">
            <p className="text-text-muted text-[10px] uppercase tracking-[0.1em]">{ta.portafolioXStock}</p>
            <p className="text-text-primary font-bold text-2xl tabular-nums mt-1" style={{ letterSpacing: '-0.02em' }}>{formatPYG(xstockTotalPYG)}</p>
            <div className="mt-3 pt-3 border-t border-border-color/50">
              <p className="text-gold/80 text-xs">{ta.soloHabiles}</p>
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
